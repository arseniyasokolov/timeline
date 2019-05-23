import { Page } from "../page.base";
import { TimelineListViewModel } from "../../data/view-models/timeline-list.view-model";
import { App } from "../../../app";
import { TimelineDocTypes } from "../../data/base/timeline-doctypes.enum";

import { listPageHtml } from "./list.page.html";
import { TransactionModel } from "../../data/models/transaction.model";
import { TimelineEventModel } from "../../data/base/timeline-event.model";
import { NewsItemModel } from "../../data/models/news-item.model";
import { Helpers } from "../../data/base/helpers";

export class ListPage extends Page {

    protected pageBlockName: string = 'list';
    private _viewModel: TimelineListViewModel;

    constructor() {
        super();
        this.initialize();
    }

    public getTemplate(): string {
        return listPageHtml;
    }

    public initializeAfterRender() {
        super.initializeAfterRender();
        this.getElement('filter-bar__item_by-date').addEventListener('click', () => {
            this._viewModel.sortByDate();
            this.renderItems();
        }
        );
        this.getElement('filter-bar__item_by-type').addEventListener('click', () => {
            this._viewModel.sortByType();
            this.renderItems();
        });
        this.renderItems();
    }

    protected initialize() {
        super.initialize();
        App.TimelineEventsService.getItems(App.Config.listDocTypes).subscribe(items => {
            this._viewModel = new TimelineListViewModel({ items, sortingMode: 'byDate' });
            console.log(this._viewModel);
        })
    }

    private renderItems() {
        this.getElement('list__body').innerHTML = this._viewModel.VisibleItems
            .map(item => this.getItemTemplate(item))
            .reduce((acc, item) => acc + item);
        this._viewModel.VisibleItems.forEach(item => {
            this.getElement(`list-item_${item.Id}`).addEventListener('click', (e: Event) => {
                Helpers.stopPropagation(e);
                App.RouterService.navigate(`info?id=${item.Id}&docType=${item.DocType}`);
            });
        })
    }

    private getItemTemplate(item: TimelineEventModel) {
        if (item instanceof TransactionModel) {
            return `
        <div class="list-item list-item_${item.Id}">
            <div class="list-item__date">${item.getFormattedDate()}</div>
            <div class="list-item__amount">${item.Amount.Formatted}</div>
            <div class="list-item__title">${item.Title}</div>
        </div>`;
        }
        if (item instanceof NewsItemModel) {
            return `
        <div class="list-item list-item_${item.Id}">
            <div class="list-item__title">${item.Title}</div>
        </div>`;
        }
    }

}
