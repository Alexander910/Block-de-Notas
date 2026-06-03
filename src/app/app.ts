import { Component, ViewChild, AfterViewInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { EditorComponent } from './components/editor/editor';
import { PapeleraComponent } from './components/papelera/papelera';


@Component({
  selector: 'app-root',
  imports: [NavbarComponent, SidebarComponent, EditorComponent, PapeleraComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  @ViewChild(EditorComponent) editor!: EditorComponent;

  searchText: string = '';
  isSidebarOpen: boolean = true;
  mostrarPapelera: boolean = false;

  ngAfterViewInit(): void {
    console.log('editor listo'); 
  }

  onSearch(value: string) {
    console.log('APP RECIBE:', value);
    this.searchText = value;
  }

  onNewNote(): void {
    console.log(' Nueva nota desde sidebar');

    this.mostrarPapelera = false;

    if (this.editor) {
      this.editor.nuevaNota();
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  abrirPapelera(): void {
    this.mostrarPapelera = true;
  }

  cerrarPapelera(): void {
    this.mostrarPapelera = false;
  }
}

