import { Observable, forkJoin, interval } from "rxjs";
import { map, first } from "rxjs/operators";
import { TimelineEntryTypes } from "../base/timeline-entry-types.enum";
import { ITimelineShowable, TimelineEntryModel } from "../base/timeline-entry.model";
import { Randomizer } from "./randomizer";
import { TimelineEventStrategy } from "../base/timeline-entry.strategy";
import { LocalStorageAdapter } from "../../../core-library/core/services/local-storage.adapter";

/** Работа с данными по записям в ленте */
export class TimelineEntriesService {

    private _localStorage: LocalStorageAdapter<ITimelineShowable>;
    /** Хеш id последних записей для каждого из типов документов */
    private _lastIdsCache: { [key: string]: string } = {};

    constructor() {
        this._localStorage = new LocalStorageAdapter<ITimelineShowable>();
        this.generateMockRequests();
    }

    /** Выдает записи указанных типов
     * @param onlyLatest будут выданы только последние записи (обновления отслеживаются автоматически)
     */
    public getItems(docTypes: TimelineEntryTypes[], onlyLatest?: boolean): Observable<TimelineEntryModel[]> {
        return forkJoin(
            docTypes.map(docType =>
                this._localStorage.get(docType.toLowerCase()).pipe(
                    map(items => {
                        if (!items)
                            return;
                        return TimelineEventStrategy.create(docType, this.handleLatest(onlyLatest, items, docType));
                    })
                )
            )
        ).pipe(
            map(results => {
                return results.reduce((acc, item) => [...acc, ...item]);
            }));
    }

    public getItemById(docType: TimelineEntryTypes, id: string): Observable<TimelineEntryModel> {
        return this.getItems([docType]).pipe(
            first(),
            map(items => items.find(i => i.Id === id)),
        );
    }

    public updateItem(docType: TimelineEntryTypes, item: ITimelineShowable): Observable<void> {
        return this._localStorage.update(docType.toLowerCase(), item);
    }

    public deleteItem(docType: TimelineEntryTypes, id: string): Observable<void> {
        return this._localStorage.delete(docType.toLowerCase(), id);
    }


    /** Выдает только последние записи */
    private handleLatest(isOnlyLatest: boolean, items: ITimelineShowable[], docType: TimelineEntryTypes): ITimelineShowable[] {
        let filteredItems = items;
        if (isOnlyLatest) {
            if (this._lastIdsCache[docType]) {
                const index = items.findIndex(i => i.id === this._lastIdsCache[docType]);
                filteredItems = index > -1 ? items.slice(index + 1) : items;
            }
        }
        if (filteredItems.length)
            this._lastIdsCache[docType] = filteredItems[filteredItems.length - 1].id;
        return filteredItems;
    }

    /** Генерирует случайные записи с опр. интервалом и записывает в local storage */
    private generateMockRequests() {
        const randomizer = new Randomizer();
        interval(10000).subscribe(() => {
            randomizer.getRandomData(TimelineEntryTypes.Transaction).subscribe(data => {
                this._localStorage.post(TimelineEntryTypes.Transaction.toLowerCase(), [data]).subscribe();
            });
            randomizer.getRandomData(TimelineEntryTypes.News).subscribe(data => {
                this._localStorage.post(TimelineEntryTypes.News.toLowerCase(), [data]).subscribe();
            });
        })
    }

}