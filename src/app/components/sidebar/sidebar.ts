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

  get notasFiltradas(): any[] {

  if (!this.searchText || this.searchText.trim() === '') {
    return this.notas;
  }

  const texto = this.searchText.toLowerCase();

  return this.notas.filter(n =>
    (n.titulo || '').toLowerCase().includes(texto)
  );
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