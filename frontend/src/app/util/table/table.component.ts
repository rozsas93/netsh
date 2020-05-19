import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';

export interface TableData<T> {
    title?: string;
    header: { title: string; property: string; editable?: boolean }[];
    data: T[];
}


@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
    @ViewChild('table', { static: false}) table: ElementRef;

    @Input('tableData') tableData: TableData<any>;

    @Output() edit: EventEmitter<any> = new EventEmitter<any>();
    @Output() editStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() editCancel: EventEmitter<any> = new EventEmitter<any>();


    @Output() delete: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit(): void {
    }

    onClickEditStart(data) {
        this.startEdit(data);

        this.editStart.emit(data);
    }

    onClickDelete(data) {
        const isEditing = Array.from(this.table.nativeElement.querySelectorAll('tr.editing')).length > 0;
        if (isEditing) {
            return;
        }

        this.delete.emit(data);
    }

    onClickCopy(data) {
        const isEditing = Array.from(this.table.nativeElement.querySelectorAll('tr.editing')).length > 0;
        if (isEditing) {
            return;
        }

        this.add(data);
    }

    onClickSave(e, data) {
        const row = e.target.parentNode;
        const cells = e.target.parentNode.getElementsByTagName('td');

        const newData = Object.assign({}, data);

        Array.from(cells).map((cell: HTMLTableCellElement) => {
            const prop = cell.dataset.property;

            if (prop) {
                newData[prop] = cell.innerText;
            }
        });

        for(let key in newData) {
            if (!newData[key]) {
                alert('All fields are required');
                return;
            }
        }

        row.classList.remove('new');
        this.resetUI();

        this.edit.emit({
            oldData: data,
            newData: newData
        });
    }

    onClickCancel(e, data) {
        const cells = e.target.parentNode.getElementsByTagName('td');

        Array.from(cells).map((cell: HTMLTableCellElement) => {
            const prop = cell.dataset.property;

            if (prop) {
                cell.innerText = data[prop];
            }
        });

        this.cancelEdit();
    }

    onClickAdd() {
        this.add();
    }

    add(defaultData = null) {
        const isEditing = Array.from(this.table.nativeElement.querySelectorAll('tr.editing')).length > 0;
        if (isEditing) {
            return;
        }


        let d: any = {};
        this.tableData.header.map(header => {
            d[header.property] = '';
        });

        if (defaultData) {
            Object.assign(d, defaultData);
        }

        this.tableData.data.push(d);

        setTimeout(() => {
            this.startEdit(d, true);
        }, 0);
    }

    private cancelEdit() {
        this.resetUI();

        this.editCancel.emit();
    }

    private startEdit(data, isNew = false) {
        const isEditing = Array.from(this.table.nativeElement.querySelectorAll('tr.editing')).length > 0;
        if (isEditing) {
            return;
        }

        const row = this.getRow(data);

        this.resetUI(row);

        row.classList.add('editing');

        if (isNew) {
            row.classList.add('new');
        }

        const cells = row.getElementsByTagName('td');
        Array.from(cells).map((c: HTMLTableCellElement) => {
            if (c.dataset.property && (c.dataset.editable === "true" || true == isNew )) {
                c.classList.add('editing');
                c.setAttribute("contenteditable", "true");
            }
        });
    }

    private resetUI(row?) {
        Array.from(this.table.nativeElement.querySelectorAll('tr.new')).map((tr: HTMLTableRowElement) => {
            tr.parentNode.removeChild(tr);
        });

        Array.from(this.table.nativeElement.getElementsByTagName('tr')).map((tr:HTMLTableRowElement) =>{
            tr.classList.remove('editing');

            const isEmpty = Array.from(tr.getElementsByTagName('td')).some((td: HTMLTableCellElement) => td.innerText === '');
            if (isEmpty && tr !== row) {
                tr.parentNode.removeChild(tr);
            }
        });

        Array.from(this.table.nativeElement.getElementsByTagName('td')).map((c: HTMLTableCellElement) =>{
            c.classList.remove('editing');
            c.setAttribute("contenteditable", "false");
        });
    }

    private getRow(data: any) {
        let row = null;

        Array.from(this.table.nativeElement.getElementsByTagName('tr')).map((tr:HTMLTableRowElement) => {
            const cells = Array.from(tr.getElementsByTagName('td'));

            let i = 0;
            cells.map(cell => {
                const prop = cell.dataset.property;
                if (prop && data[prop] === cell.innerText) {
                    i++;
                }
            });

            if (i === Object.keys(data).length) {
                row = tr;
            }
        });

        return row;
    }
}
