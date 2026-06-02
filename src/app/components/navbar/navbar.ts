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

   titulo: string = '';
  searchText: string = '';
  @Output() searchChange = new EventEmitter<string>();
  
  onSearchChange(): void {
     console.log('SEARCH:', this.searchText);
      this.searchChange.emit(this.searchText);
  }

  toggleSidebar(): void {
    console.log('toggle sidebar');
  }

 toggleDarkMode(): void {
   document.body.classList.toggle('dark-mode');

  console.log(document.body.classList.contains('dark-mode'));
  }
}

