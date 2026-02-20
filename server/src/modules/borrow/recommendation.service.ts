import mongoose from 'mongoose';
import { Borrow, IBorrow } from './borrow.model';
import { Edition } from '../book/edition.model';
import { Work } from '../book/work.model';
import { IWork } from '../book/work.model';
import { IEdition } from '../book/edition.model';
import { Types } from 'mongoose';

interface PopulatedEdition extends Omit<IEdition, 'work'> {
    _id: Types.ObjectId;
    work: IWork & { _id: Types.ObjectId };
}
interface CopyWithEdition {
    edition: PopulatedEdition & { _id: Types.ObjectId };
    [key: string]: unknown;
}

interface IBorrowWithCopy extends Omit<IBorrow, 'copy'> {
    copy: CopyWithEdition;
}

export interface ExplainableRecommendation {
    edition: {
        _id: string;
        isbn: string;
        format: string;
        coverImageUrl?: string;
        work: {
            _id: string;
            title: string;
            originalAuthor: string;
            genres: string[];
            description?: string;
        };
    };
    explanation: string;
    score: number;
}

export const getRecommendations = async (userId: string, limit: number = 10): Promise<ExplainableRecommendation[]> => {
    console.log(`[Recommendations] Triggered for user ${userId}`);
    const recommendationsMap = new Map<string, ExplainableRecommendation>();

    const userHistoryRaw = await Borrow.find({ user: userId })
        .populate({
            path: 'copy',
            populate: {
                path: 'edition',
                populate: { path: 'work' }
            }
        })
        .lean();

    const userHistory = (userHistoryRaw as unknown as IBorrowWithCopy[]).filter(b => b.copy && b.copy.edition && b.copy.edition.work);

    const readEditionIds = new Set(userHistory.map(b => b.copy.edition._id.toString()));
    const readWorkIds = new Set(userHistory.map(b => b.copy.edition.work._id.toString()));

    if (userHistory.length === 0) {
        return getGlobalPopularRecommendations(limit);
    }
    const authorCounts = new Map<string, number>();
    const genreCounts = new Map<string, number>();

    userHistory.forEach(record => {
        const work = record.copy.edition.work;

        if (work.originalAuthor) {
            authorCounts.set(work.originalAuthor, (authorCounts.get(work.originalAuthor) || 0) + 1);
        }
        if (work.genres && Array.isArray(work.genres)) {
            work.genres.forEach((genre: string) => {
                genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
            });
        }
    });

    const favoriteAuthors = Array.from(authorCounts.entries())
        .filter(([_, count]) => count >= 2)
        .map(([author, _]) => author);

    if (favoriteAuthors.length > 0) {
        const authorWorks = await Work.find({
            originalAuthor: { $in: favoriteAuthors },
            _id: { $nin: Array.from(readWorkIds) }
        }).limit(20);

        for (const work of authorWorks) {
            const edition = await Edition.findOne({ work: work._id }).populate('work') as unknown as PopulatedEdition | null;
            if (edition) {
                addOrUpdateRecommendation(recommendationsMap, edition,
                    `You read ${authorCounts.get(work.originalAuthor)} books by ${work.originalAuthor}`,
                    30);
            }
        }
    }

    const favoriteGenres = Array.from(genreCounts.entries())
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, _]) => genre);

    if (favoriteGenres.length > 0) {
        const genreWorks = await Work.find({
            genres: { $in: favoriteGenres },
            _id: { $nin: Array.from(readWorkIds) }
        }).limit(20);

        for (const work of genreWorks) {
            const edition = await Edition.findOne({ work: work._id }).populate('work') as unknown as PopulatedEdition | null;
            if (edition) {
                const matchedGenre = work.genres.find(g => favoriteGenres.includes(g)) || favoriteGenres[0];
                addOrUpdateRecommendation(recommendationsMap, edition,
                    `Because you frequently read ${matchedGenre}`,
                    20);
            }
        }
    }

    if (readEditionIds.size > 0) {
        const similarBorrowsRaw = await Borrow.aggregate([
            {
                $lookup: {
                    from: 'copies',
                    localField: 'copy',
                    foreignField: '_id',
                    as: 'copyDoc'
                }
            },
            { $unwind: '$copyDoc' },
            {
                $match: {
                    'copyDoc.edition': { $in: Array.from(readEditionIds).map(id => new mongoose.Types.ObjectId(id)) },
                    user: { $ne: new mongoose.Types.ObjectId(userId) }
                }
            },
            {
                $group: {
                    _id: '$user',
                    sharedBorrowsCount: { $sum: 1 }
                }
            },
            { $sort: { sharedBorrowsCount: -1 } },
            { $limit: 10 }
        ]);

        const similarUserIds = similarBorrowsRaw.map(u => u._id);

        if (similarUserIds.length > 0) {
            const whatElseTheyReadRaw = await Borrow.aggregate([
                { $match: { user: { $in: similarUserIds } } },
                {
                    $lookup: {
                        from: 'copies',
                        localField: 'copy',
                        foreignField: '_id',
                        as: 'copyDoc'
                    }
                },
                { $unwind: '$copyDoc' },
                {
                    $match: {
                        'copyDoc.edition': { $nin: Array.from(readEditionIds).map(id => new mongoose.Types.ObjectId(id)) }
                    }
                },
                {
                    $group: {
                        _id: '$copyDoc.edition',
                        popularityAmongSimilarUsers: { $sum: 1 }
                    }
                },
                { $match: { popularityAmongSimilarUsers: { $gte: 2 } } }, 
                { $sort: { popularityAmongSimilarUsers: -1 } },
                { $limit: 15 }
            ]);

            for (const item of whatElseTheyReadRaw) {
                const edition = await Edition.findById(item._id).populate('work') as PopulatedEdition | null;
                if (edition && !edition.work?._id) continue;

                if (edition && !readWorkIds.has(edition.work._id.toString())) {
                    addOrUpdateRecommendation(recommendationsMap, edition,
                        `Members with similar reading history enjoyed this`,
                        item.popularityAmongSimilarUsers * 10);
                }
            }
        }
    }

    if (recommendationsMap.size < limit) {
        const globalRecs = await getGlobalPopularRecommendations(limit * 2);
        for (const rec of globalRecs) {
            if (!readEditionIds.has(rec.edition._id.toString()) && recommendationsMap.size < limit) {
                if (!recommendationsMap.has(rec.edition._id.toString())) {
                    recommendationsMap.set(rec.edition._id.toString(), rec);
                }
            }
        }
    }

    const finalRecs = Array.from(recommendationsMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    if (finalRecs.length < limit) {
        const needed = limit - finalRecs.length;
        const randomEditions = await Edition.aggregate([
            { $match: { _id: { $nin: Array.from(readEditionIds).map(id => new mongoose.Types.ObjectId(id)) } } },
            { $sample: { size: needed } }
        ]);

        for (const item of randomEditions) {
            const edition = await Edition.findById(item._id).populate('work') as PopulatedEdition | null;
            if (edition && (edition.work as IWork)) {
                finalRecs.push({
                    edition: {
                        _id: edition._id.toString(),
                        isbn: edition.isbn,
                        format: edition.format,
                        coverImageUrl: edition.coverImageUrl || edition.work.coverImageUrl,
                        work: {
                            _id: edition.work._id.toString(),
                            title: edition.work.title,
                            originalAuthor: edition.work.originalAuthor,
                            genres: edition.work.genres || [],
                            description: edition.work.description,
                        }
                    },
                    explanation: `Staff pick for you`,
                    score: 1
                });
            }
        }
    }

    console.log(`[Recommendations] Final array size: ${finalRecs.length}`, JSON.stringify(finalRecs, null, 2));

    return finalRecs;
};

function addOrUpdateRecommendation(map: Map<string, ExplainableRecommendation>, edition: PopulatedEdition, explanation: string, addScore: number) {
    const id = edition._id.toString();
    if (map.has(id)) {
        const existing = map.get(id)!;
        existing.score += addScore;
    } else {
        map.set(id, {
            edition: {
                _id: edition._id.toString(),
                isbn: edition.isbn,
                format: edition.format,
                coverImageUrl: edition.coverImageUrl || edition.work.coverImageUrl,
                work: {
                    _id: edition.work._id.toString(),
                    title: edition.work.title,
                    originalAuthor: edition.work.originalAuthor,
                    genres: edition.work.genres || [],
                    description: edition.work.description,
                }
            },
            explanation,
            score: addScore
        });
    }
}

async function getGlobalPopularRecommendations(limit: number): Promise<ExplainableRecommendation[]> {
    const popularRaw = await Borrow.aggregate([
        {
            $lookup: {
                from: 'copies',
                localField: 'copy',
                foreignField: '_id',
                as: 'copyDoc'
            }
        },
        { $unwind: '$copyDoc' },
        {
            $group: {
                _id: '$copyDoc.edition',
                borrowCount: { $sum: 1 }
            }
        },
        { $sort: { borrowCount: -1 } },
        { $limit: limit }
    ]);

    const results: ExplainableRecommendation[] = [];

    for (const item of popularRaw) {
        const edition = await Edition.findById(item._id).populate('work') as PopulatedEdition | null;
        if (edition && (edition.work as IWork)) {
            results.push({
                edition: {
                    _id: edition._id.toString(),
                    isbn: edition.isbn,
                    format: edition.format,
                    coverImageUrl: edition.coverImageUrl || edition.work.coverImageUrl,
                    work: {
                        _id: edition.work._id.toString(),
                        title: edition.work.title,
                        originalAuthor: edition.work.originalAuthor,
                        genres: edition.work.genres || [],
                        description: edition.work.description,
                    }
                },
                explanation: `Currently trending across all libraries`,
                score: item.borrowCount
            });
        }
    }

    console.log(`[Recommendations] Global Popular Fallback yielded: ${results.length} items`);
    return results;
}
