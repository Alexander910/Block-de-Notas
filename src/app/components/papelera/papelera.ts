import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-papelera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './papelera.html',
  styleUrl: './papelera.css'
})
export class PapeleraComponent implements OnInit, OnDestroy {

  notasPapelera: any[] = [];
  private sub!: Subscription;

  @Output() cerrar = new EventEmitter<void>();

  constructor(private notasService: NotasService) {}

  ngOnInit(): void {
    // Limpiar notas expiradas (>30 días) al abrir
    this.notasService.limpiarNotasExpiradas();

    // Cargar notas de la papelera
    this.notasService.refrescarPapelera();
    this.sub = this.notasService.papelera$.subscribe(notas => {
      this.notasPapelera = notas;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  /** Calcula los días restantes antes de la eliminación permanente */
  diasRestantes(fechaEliminacion: string): number {
    const eliminacion = new Date(fechaEliminacion).getTime();
    const ahora = new Date().getTime();
    const treintaDiasMs = 30 * 24 * 60 * 60 * 1000;
    const restanteMs = treintaDiasMs - (ahora - eliminacion);
    return Math.max(0, Math.ceil(restanteMs / (24 * 60 * 60 * 1000)));
  }

  restaurarNota(nota: any): void {
    if (!confirm('¿Desea restaurar esta nota?')) return;

    this.notasService.restaurarNota(nota.id, nota).subscribe({
      next: () => {
        alert('Nota restaurada correctamente');
      },
      error: (err) => {
        console.error(err);
        alert('Error al restaurar la nota');
      }
    });
  }

  eliminarDefinitivamente(nota: any): void {
    if (!confirm('¿Eliminar esta nota definitivamente? Esta acción no se puede deshacer.')) return;

    this.notasService.eliminarDefinitivamente(nota.id).subscribe({
      next: () => {
        alert('Nota eliminada definitivamente');
      },
      error: (err) => {
        console.error(err);
        alert('Error al eliminar la nota');
      }
    });
  }

  vaciarPapelera(): void {
    if (!confirm('¿Vaciar toda la papelera? Esta acción no se puede deshacer.')) return;

    this.notasService.vaciarPapelera().subscribe({
      next: () => {
        alert('Papelera vaciada');
      },
      error: (err) => {
        console.error(err);
        alert('Error al vaciar la papelera');
      }
    });
  }

  volver(): void {
    this.cerrar.emit();
  }
}
