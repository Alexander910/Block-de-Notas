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
  @Output() openPapelera = new EventEmitter<void>();

  crearNota(): void {
    this.newNote.emit();
  }

  abrirPapelera(): void {
    this.openPapelera.emit();
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

  
  

  loading = true;
  notaSeleccionada: any = null;

  constructor(
    private notasService: NotasService
  ) {}

  ngOnInit(): void {
    this.cargarNotas();

    // Suscribirse a cambios reactivos (cuando se elimina/restaura una nota)
    this.notasService.notas$.subscribe(notas => {
      if (notas && notas.length > 0) {
        this.notas = notas;
      }
    });

    // Guardar referencia a la nota actual para el PDF
    this.notasService.notaSeleccionada$.subscribe(nota => {
      this.notaSeleccionada = nota;
    });
  }

  cargarNotas(): void {
    this.loading = true;
    this.notasService
      .obtenerNotas()
      .subscribe({
        next: (data: any) => {

          if (!data) {
            this.notas = [];
          } else {
            this.notas = Object.keys(data).map(id => ({
              id,
              ...data[id]
            }));
          }
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
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
  if (!this.notaSeleccionada) {
    alert('Seleccione una nota para exportar');
    return;
  }

  // Use dynamic import for html2pdf because it might rely on window object
  import('html2pdf.js').then((html2pdfModule) => {
    const html2pdf: any = (html2pdfModule as any).default ? (html2pdfModule as any).default : html2pdfModule;
    
    const titulo = this.notaSeleccionada.titulo && this.notaSeleccionada.titulo.trim() !== '' 
      ? this.notaSeleccionada.titulo.trim() 
      : 'Sin titulo';
      
    const filename = `${titulo}.pdf`;
    
    // Crear un contenedor temporal para el contenido
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="border-bottom: 1px solid #ccc; padding-bottom: 10px;">${titulo}</h1>
        <div>${this.notaSeleccionada.contenido || ''}</div>
      </div>
    `;

    const opt = {
      margin:       1,
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  });
}



  

}