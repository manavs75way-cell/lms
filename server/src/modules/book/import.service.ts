import fs from 'fs';
import csv from 'csv-parser';
import { Work } from './work.model';
import { Edition, IEdition } from './edition.model';
import { Copy } from './copy.model';
import { generateBothCodes } from '../../utils/barcode';

interface CSVRow {
    title: string;
    author: string;
    isbn: string;
    genre: string;
    publisher: string;
    format: string;
    publicationYear: string;
    language: string;
    replacementCost: string;
    totalCopies: string;
    branch: string;
    libraryId: string;
    coverImageUrl?: string;
}

interface NearDuplicate {
    csvRow: CSVRow;
    existingMatch: {
        workId: string;
        workTitle: string;
        workAuthor: string;
        editionId?: string;
        editionISBN?: string;
    };
    similarityScore: number;
    matchType: 'ISBN_EXACT' | 'TITLE_AUTHOR_SIMILAR';
}

interface ImportResult {
    imported: number;
    nearDuplicates: NearDuplicate[];
    errors: string[];
}


const diceSimilarity = (a: string, b: string): number => {
    const strA = a.toLowerCase().trim();
    const strB = b.toLowerCase().trim();

    if (strA === strB) return 1.0;
    if (strA.length < 2 || strB.length < 2) return 0;

    const bigramsA = new Set<string>();
    for (let i = 0; i < strA.length - 1; i++) {
        bigramsA.add(strA.substring(i, i + 2));
    }

    const bigramsB = new Set<string>();
    for (let i = 0; i < strB.length - 1; i++) {
        bigramsB.add(strB.substring(i, i + 2));
    }

    let intersectionSize = 0;
    for (const bigram of bigramsA) {
        if (bigramsB.has(bigram)) intersectionSize++;
    }

    return (2 * intersectionSize) / (bigramsA.size + bigramsB.size);
};


export const parseAndImportBooks = (filePath: string): Promise<ImportResult> => {
    return new Promise((resolve, reject) => {
        const rows: CSVRow[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: CSVRow) => {
                rows.push(data);
            })
            .on('end', async () => {
                try {
                    const result: ImportResult = {
                        imported: 0,
                        nearDuplicates: [],
                        errors: [],
                    };

                    for (const row of rows) {
                        try {
                            const existingEdition = await Edition.findOne({
                                isbn: row.isbn,
                            }).populate('work');

                            if (existingEdition) {
                                const work = existingEdition.work as unknown as {
                                    _id: string;
                                    title: string;
                                    originalAuthor: string;
                                };
                                result.nearDuplicates.push({
                                    csvRow: row,
                                    existingMatch: {
                                        workId: work._id.toString(),
                                        workTitle: work.title,
                                        workAuthor: work.originalAuthor,
                                        editionId: existingEdition._id.toString(),
                                        editionISBN: existingEdition.isbn,
                                    },
                                    similarityScore: 1.0,
                                    matchType: 'ISBN_EXACT',
                                });
                                continue;
                            }

                            const allWorks = await Work.find();
                            let bestMatch: {
                                work: typeof allWorks[0];
                                score: number;
                            } | null = null;

                            for (const existingWork of allWorks) {
                                const titleSim = diceSimilarity(
                                    row.title,
                                    existingWork.title
                                );
                                const authorSim = diceSimilarity(
                                    row.author,
                                    existingWork.originalAuthor
                                );
                                const combinedScore = titleSim * 0.6 + authorSim * 0.4;

                                if (
                                    combinedScore > 0.8 &&
                                    (!bestMatch || combinedScore > bestMatch.score)
                                ) {
                                    bestMatch = { work: existingWork, score: combinedScore };
                                }
                            }

                            if (bestMatch) {
                                result.nearDuplicates.push({
                                    csvRow: row,
                                    existingMatch: {
                                        workId: bestMatch.work._id.toString(),
                                        workTitle: bestMatch.work.title,
                                        workAuthor: bestMatch.work.originalAuthor,
                                    },
                                    similarityScore:
                                        Math.round(bestMatch.score * 100) / 100,
                                    matchType: 'TITLE_AUTHOR_SIMILAR',
                                });
                                continue;
                            }

                            
                            const work = await Work.create({
                                title: row.title,
                                originalAuthor: row.author,
                                genres: row.genre
                                    ? row.genre.split(',').map((g) => g.trim())
                                    : [],
                                coverImageUrl: row.coverImageUrl,
                            });

                            const edition = await Edition.create({
                                work: work._id,
                                isbn: row.isbn,
                                format:
                                    (row.format as IEdition['format']) || 'PAPERBACK',
                                publisher: row.publisher,
                                publicationYear: parseInt(row.publicationYear, 10) || new Date().getFullYear(),
                                language: row.language || 'English',
                                replacementCost: parseFloat(row.replacementCost) || 0,
                                coverImageUrl: row.coverImageUrl,
                            });

                            const totalCopies = parseInt(row.totalCopies, 10) || 1;
                            for (let i = 0; i < totalCopies; i++) {
                                const copyCode = `${row.isbn}-${String(i + 1).padStart(3, '0')}`;

                                const copy = await Copy.create({
                                    edition: edition._id,
                                    copyCode,
                                    owningLibrary: row.libraryId,
                                    currentLibrary: row.libraryId,
                                    condition: 'GOOD',
                                    acquiredDate: new Date(),
                                });

                                try {
                                    const { barcodeUrl, qrCodeUrl } =
                                        await generateBothCodes(
                                            copyCode,
                                            copy._id.toString()
                                        );
                                    copy.barcodeUrl = barcodeUrl;
                                    copy.qrCodeUrl = qrCodeUrl;
                                    await copy.save();
                                } catch (err) {
                                    console.error(
                                        'Failed to generate codes for copy:',
                                        err
                                    );
                                }
                            }

                            result.imported++;
                        } catch (rowError) {
                            result.errors.push(
                                `Row (ISBN: ${row.isbn}): ${(rowError as Error).message}`
                            );
                        }
                    }

                    fs.unlinkSync(filePath);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};


export const resolveNearDuplicate = async (data: {
    action: 'MERGE' | 'SKIP' | 'CREATE_NEW';
    csvRow: CSVRow;
    existingWorkId?: string;
    libraryId: string;
}) => {
    const { action, csvRow, existingWorkId, libraryId } = data;

    if (action === 'SKIP') {
        return { action: 'SKIPPED' };
    }

    if (action === 'MERGE' && existingWorkId) {
        const edition = await Edition.create({
            work: existingWorkId,
            isbn: csvRow.isbn,
            format: (csvRow.format as IEdition['format']) || 'PAPERBACK',
            publisher: csvRow.publisher,
            publicationYear: parseInt(csvRow.publicationYear, 10) || new Date().getFullYear(),
            language: csvRow.language || 'English',
            replacementCost: parseFloat(csvRow.replacementCost) || 0,
            coverImageUrl: csvRow.coverImageUrl,
        });

        const totalCopies = parseInt(csvRow.totalCopies, 10) || 1;
        for (let i = 0; i < totalCopies; i++) {
            const copyCode = `${csvRow.isbn}-${String(i + 1).padStart(3, '0')}`;
            await Copy.create({
                edition: edition._id,
                copyCode,
                owningLibrary: libraryId,
                currentLibrary: libraryId,
                condition: 'GOOD',
                acquiredDate: new Date(),
            });
        }

        return { action: 'MERGED', editionId: edition._id };
    }

    if (action === 'CREATE_NEW') {
        const work = await Work.create({
            title: csvRow.title,
            originalAuthor: csvRow.author,
            genres: csvRow.genre ? csvRow.genre.split(',').map((g) => g.trim()) : [],
            coverImageUrl: csvRow.coverImageUrl,
        });

        const edition = await Edition.create({
            work: work._id,
            isbn: csvRow.isbn,
            format: (csvRow.format as IEdition['format']) || 'PAPERBACK',
            publisher: csvRow.publisher,
            publicationYear: parseInt(csvRow.publicationYear, 10) || new Date().getFullYear(),
            language: csvRow.language || 'English',
            replacementCost: parseFloat(csvRow.replacementCost) || 0,
            coverImageUrl: csvRow.coverImageUrl,
        });

        const totalCopies = parseInt(csvRow.totalCopies, 10) || 1;
        for (let i = 0; i < totalCopies; i++) {
            const copyCode = `${csvRow.isbn}-${String(i + 1).padStart(3, '0')}`;
            await Copy.create({
                edition: edition._id,
                copyCode,
                owningLibrary: libraryId,
                currentLibrary: libraryId,
                condition: 'GOOD',
                acquiredDate: new Date(),
            });
        }

        return { action: 'CREATED', workId: work._id, editionId: edition._id };
    }

    throw new Error('Invalid action');
};
