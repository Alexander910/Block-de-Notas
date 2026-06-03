import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { NotasService } from '../../services/notas.service';
import { CommonModule } from '@angular/common';
import { schema } from './schema';
import { EditorToolbarComponent } from '../editor-toolbar/editor-toolbar';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxEditorModule,
    EditorToolbarComponent,
  ],
  templateUrl: './editor.html',
  styleUrl: './editor.css'
})
export class EditorComponent implements OnInit, OnDestroy {

  editor!: Editor;

  toolbar: Toolbar = [
    ['undo', 'redo'],
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['format_clear']
  ];


  titulo: string = '';
  html: string  = '';
  notaActualId: string | null = null;
  modoEdicion = false;
  fechaCreacion: string = '';
  fechaEdicion: string = '';



   constructor(
    private notasService: NotasService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor({ schema });

  this.notasService.notaSeleccionada$
    .subscribe(nota => {
      

      if (!nota){
        this.limpiarFormulario();
       return;
      }

        this.notaActualId = nota.id;
      this.titulo = nota.titulo ?? '';
      this.html = nota.contenido ?? '';
      this.fechaCreacion = nota.fechaCreacion;
      this.fechaEdicion = nota.fechaActualizacion;

      this.modoEdicion = true;


    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

   guardarNota(): void {

    const nota = {
        titulo: this.titulo,
        contenido: this.html,
        fechaCreacion: this.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
    };

    if (!this.modoEdicion || !this.notaActualId) {

      this.notasService.crearNota(nota).subscribe({
          next: () => {

            alert('Nota guardada correctamente');

            this.limpiarFormulario();
            
             this.notasService.obtenerNotas().subscribe((data: any) => {
              const notas = data
               ? Object.keys(data).map(id => ({ id, ...data[id] }))
              : [];

              this.notasService.refrescarNotas();
             });

          },
          error: (error) => {

            console.error(error);

            alert('Error al guardar');

          }
        });

      return;
    }

    this.notasService
      .actualizarNota(this.notaActualId, nota)
      .subscribe({
        next: () => {

          alert('Nota actualizada correctamente');

        },
        error: (error) => {

          console.error(error);

          alert('Error al actualizar');

        }
      });

  }

  cargarNota(id: string, nota: any): void {

    this.notaActualId = id;

    this.titulo = nota.titulo;
    this.html = nota.contenido;

    this.modoEdicion = true;

  }

  eliminarNota(): void {

    if (!this.notaActualId) {
      alert('No hay nota seleccionada');
      return;
    }

    if (!confirm('¿Desea eliminar esta nota?')) {
      return;
    }

    this.notasService
      .eliminarNota(this.notaActualId)
      .subscribe({
        next: () => {

          alert('Nota eliminada');

          this.limpiarFormulario();

        },
        error: (error) => {

          console.error(error);

          alert('Error al eliminar');

        }
      });

  }

  limpiarFormulario(): void {

    this.titulo = '';
    this.html = '';

    this.notaActualId = null;
    this.modoEdicion = false;

  }

  nuevaNota(): void {
  this.titulo = '';
  this.html = '';
  this.notaActualId = null;
  this.modoEdicion = false;
  }

}
