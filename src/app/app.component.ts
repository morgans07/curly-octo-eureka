import { Component, EventEmitter, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChangeDetectionStrategy, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatCalendar, MatCalendarView, MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { combineLatest, startWith, Subscription } from 'rxjs';
import { DatePipe, JsonPipe, NgFor } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatToolbarModule,
    ReactiveFormsModule,
    MatDividerModule, MatCheckboxModule,
    RouterOutlet, MatCardModule,
    MatDatepickerModule,
    JsonPipe,
    MatMenuModule,
    MatIconModule, MatButtonModule,
    FormsModule, MatInputModule,
    MatRippleModule,
    MatFormFieldModule],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // @ViewChild(MatMenuTrigger) contextMenuTrigger!: MatMenuTrigger;
  // @ViewChild('contextMenuTrigger', { static: true }) contextMenuTrigger!: MatMenuTrigger;
  @ViewChild(MatMenuTrigger, { static: false }) menuTrigger!: MatMenuTrigger;

  // Store cursor position
  // menuTopLeftPosition = { x: '0px', y: '0px' };
  // Trigger menu manually at mouse position
  openContextMenu(event: MouseEvent, day: number): void {
    event.preventDefault(); // prevent browser menu

    console.log('Context menu opened for day:', this.menuTrigger);
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
  
    // Calculate the center of the clicked element
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
  
    // Set the menu position
    this.menuTrigger.menuOpened.subscribe(() => {
      const overlay = this.menuTrigger['_overlayRef'];
      if (overlay) {
        overlay.updatePositionStrategy(
          overlay.position()
            .global()
            .left(`${centerX}px`)
            .top(`${centerY}px`)
        );
      }
    });
    // Calculate the center of the clicked element
    // const target = event.target as HTMLElement;
    // const rect = target.getBoundingClientRect();
    // const centerX = rect.left + rect.width / 2;
    // const centerY = rect.top + rect.height / 2;

    // // Set the menu position
    // this.menuTopLeftPosition = { x: `${centerX}px`, y: `${centerY}px` };

    // Open the menu
    // this.menuTrigger.openMenu();
  }

  @ViewChild('picker') picker!: MatCalendar<Date>;

  dateControl = new FormControl(new Date());
  daysInMonth: number[] = [];
  emptyDaysInMonth: number[] = [];
  inputControl = new FormControl('');
  combinedValues: any = {}; // Property to store the combined values
  startDayOfMonth: number = 0; // Day of the week the month starts on (0 = Sunday)
  selectedDay: number | null = null;


  events: { start: Date; end: Date; title: string }[] = [
    { start: new Date(2025, 2, 5), end: new Date(2025, 2, 7), title: 'Conference' },
    { start: new Date(2025, 2, 12), end: new Date(2025, 2, 12), title: 'Project Deadline' },
    { start: new Date(2025, 2, 20), end: new Date(2025, 2, 22), title: 'Vacation' },
  ];

  inputControl1 = new FormControl('');
  inputControl2 = new FormControl('');
  inputControl3 = new FormControl('');
  private readonly _formBuilder = inject(FormBuilder);

  readonly toppings = this._formBuilder.group({
    requisition1: false,
    requisition2: false,
    requisition3: false,
  });

  // events: { [key: number]: string[] } = {
  //   5: ['Meeting at 10 AM', 'Lunch with Sarah'],
  //   12: ['Project deadline'],
  //   20: ['Doctor appointment'],
  //   25: ['Birthday partyssssssssasdasd ssd'],
  // };

  // Helper function to check if an event spans a specific day
  isEventOnDay(day: number, event: { start: Date; end: Date }): boolean {
    const year = this.dateControl.value?.getFullYear();
    const month = this.dateControl.value?.getMonth();
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const currentDay = new Date(year ?? 2025, month ?? 3, day);

    return currentDay >= eventStart && currentDay <= eventEnd;
  }

  selected = model<Date | null>(null);
  value = "c;ear me";

  title = 'ang-sing-mat';

  private stateSub?: Subscription;

  ngAfterViewInit(): void {
    this.stateSub = this.picker.stateChanges.subscribe(() => {
      // this.picker.viewChanged
      console.log('Current view month/year:', this.picker.activeDate);

      // console.log('DateRangePicker state changed', );
    });
  }

  ngOnInit() {
    this.updateCalendar();

    // Combine the latest values from all three inputs
    combineLatest([
      this.dateControl.valueChanges.pipe(startWith(this.dateControl.value)),
      this.inputControl.valueChanges.pipe(startWith(this.inputControl.value)),
      this.toppings.valueChanges.pipe(startWith(this.toppings.value)),
    ]).subscribe(([value1, value2, value3]) => {

      // based on value 2


      console.log('Combined values:', { value1, value2, value3 });
      this.combinedValues = { value1, value2, value3 }; // Update the property

      // Generate an array of days for the month based on value2
      if (this.isValidDate(value1)) {
        this.daysInMonth = this.getDaysInMonth(value1);
        // const daysInMonth = this.getDaysInMonth(value1);
        // console.log('Days in month:', daysInMonth);
      }
      this.updateCalendar();

    });
  }
  // Update the calendar when the month changes
  updateCalendar(): void {
    const currentDate = this.dateControl.value;
    if (this.isValidDate(currentDate)) {
      this.daysInMonth = this.getDaysInMonth(currentDate);
      this.startDayOfMonth = this.getStartDayOfMonth(currentDate);
      this.emptyDaysInMonth = [];
      for (let i = 0; i < this.startDayOfMonth; i++) {
        this.emptyDaysInMonth.push(i); // Fill empty days before the start of the month
      }
    }
  }

  // EventEmitter<MatCalendarView>
  // This is just calendar changing so like :month: year: multi-year
  matCalendarViewChanged(event: any) {
    console.log(event);
  }

  // Helper function to get the starting day of the month
  getStartDayOfMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // Get the day of the week for the 1st of the month
  }

  // To match behavior of other calendars you would need a selected date and view date?
  moveMonth(monthOffset: number) {
    const date = this.dateControl.value;
    if (this.isValidDate(date)) {
      date.setMonth(date.getMonth() + monthOffset);
      this.dateControl.setValue(date);
    }
  }

  // Helper function to generate an array of days in the month
  getDaysInMonth(date: Date): number[] {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based index for months
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get the last day of the month
    return Array.from({ length: daysInMonth }, (_, i) => i + 1); // Generate an array [1, 2, ..., daysInMonth]
  }

  // Helper function to check if a value is a valid Date object
  private isValidDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  // openContextMenu(event: MouseEvent, day: number): void {
  //   event.preventDefault(); // Prevent the default browser context menu
  //   this.contextMenuTrigger.menuData = { day }; // Pass data to the menu
  //   this.contextMenuTrigger.openMenu(); // Open the menu
  // }

  // openContextMenu(event: MouseEvent, day: number): void {
  //   event.preventDefault(); // Prevent the default browser context menu
  //   this.selectedDay = day; // Store the selected day
  //   // this.contextMenuTrigger.openMenu(); // Programmatically open the menu
  // }

  onAddEvent(day: number | null): void {
    console.log('Add event for day:', day);
  }

  onEditEvent(day: number | null): void {
    console.log('Edit event for day:', day);
  }

  onDeleteEvent(day: number | null): void {
    console.log('Delete event for day:', day);
  }
}
