import { Component,EventEmitter,Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class NavbarComponent {


  searchText: string = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sidebarToggle = new EventEmitter<void>();
  
  onSearchChange(): void {
     console.log('SEARCH:', this.searchText);
      this.searchChange.emit(this.searchText);
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

 toggleDarkMode(): void {
   document.body.classList.toggle('dark-mode');

  console.log(document.body.classList.contains('dark-mode'));
  }
}

