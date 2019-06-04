
import { TimelineDocTypes } from "./timeline-doc-types.enum";
import { TimelineEventModel, ITimelineEvent } from "./timeline-event.model";
import { TransactionModel, ITransaction } from "../models/transaction.model";
import { NewsItemModel, INewsItem } from "../models/news-item.model";

/** Фабрика: преобразует данные о событиях ленты новостей в соотв. модели, исходя из типа события */
export function timelineModelsFabric(docType: TimelineDocTypes, response: ITimelineEvent[]): TimelineEventModel[] {
    switch (docType) {
        case TimelineDocTypes.Transaction: return TransactionModel.handleResponse(response as ITransaction[]);
        case TimelineDocTypes.News: return NewsItemModel.handleResponse(response as INewsItem[]);
        default: return [];
    }
}