import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {

  notas: any[] = [];
  
  private _searchText = '';

    @Input()
    set searchText(value: string) {
      this._searchText = value;
    }

    get searchText(): string {
    return this._searchText;
  }

  @Output() newNote = new EventEmitter<void>();

  crearNota(): void {
    this.newNote.emit();
  }

  mostrarTodasLasNotas = false;

  toggleMostrarNotas(event: Event): void {
    event.preventDefault();
    this.mostrarTodasLasNotas = !this.mostrarTodasLasNotas;
  }

  get notasFiltradas(): any[] {
    let filtradas = this.notas;

    if (this.searchText && this.searchText.trim() !== '') {
      const texto = this.searchText.toLowerCase();
      filtradas = this.notas.filter(n =>
        (n.titulo || '').toLowerCase().includes(texto)
      );
    }

    if (!this.mostrarTodasLasNotas) {
      return filtradas.slice(0, 4);
    }

    return filtradas;
  }

  
  

  constructor(
    private notasService: NotasService
  ) {}

  ngOnInit(): void {
    this.cargarNotas();
  }

  cargarNotas(): void {

    this.notasService
      .obtenerNotas()
      .subscribe({
        next: (data: any) => {

          if (!data) {
            this.notas = [];
            return;
          }

          this.notas = Object.keys(data).map(id => ({
            id,
            ...data[id]
          }));

        },
        error: (error) => {
          console.error(error);
        }
      });

  }

   seleccionarNota(nota: any): void {
    this.notasService.seleccionarNota(nota);
  }

  abrirParafraseador(): void {
  console.log('AI Paraphraser');
}

abrirResumen(): void {
  console.log('AI Summarizer');
}

exportarPDF(): void {
  console.log('Exportar PDF');
}


  

}