import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Nota {
  id?: string;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface NotaPapelera extends Nota {
  fechaEliminacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotasService {

  private baseUrl = 'https://notas-25009-default-rtdb.firebaseio.com';
  private apiUrl = `${this.baseUrl}/notas`;
  private papeleraUrl = `${this.baseUrl}/papelera`;

  private notasSubject = new BehaviorSubject<any[]>([]);
  notas$ = this.notasSubject.asObservable();

  private papeleraSubject = new BehaviorSubject<any[]>([]);
  papelera$ = this.papeleraSubject.asObservable();

  private notaSeleccionadaSource = new BehaviorSubject<any>(null);
  notaSeleccionada$ = this.notaSeleccionadaSource.asObservable();

  constructor(private http: HttpClient) {}

 
  seleccionarNota(nota: any): void {
    this.notaSeleccionadaSource.next(nota);
  }

  
  refrescarNotas(): void {
    this.http.get(`${this.apiUrl}.json`).subscribe((data: any) => {

      const notas = data
        ? Object.keys(data).map(id => ({ id, ...data[id] }))
        : [];

      this.notasSubject.next(notas);
    });
  }

  refrescarPapelera(): void {
    this.http.get(`${this.papeleraUrl}.json`).subscribe((data: any) => {
      const notas = data
        ? Object.keys(data).map(id => ({ id, ...data[id] }))
        : [];
      this.papeleraSubject.next(notas);
    });
  }

  obtenerNotas(): Observable<any> {
    return this.http.get(`${this.apiUrl}.json`);
  }

  obtenerPapelera(): Observable<any> {
    return this.http.get(`${this.papeleraUrl}.json`);
  }

  
  crearNota(nota: Nota): Observable<any> {
    return new Observable(observer => {

      this.http.post(`${this.apiUrl}.json`, nota).subscribe({
        next: (res) => {

          this.refrescarNotas();

          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });

    });
  }


  actualizarNota(id: string, nota: Nota): Observable<any> {
    return new Observable(observer => {

      this.http.put(`${this.apiUrl}/${id}.json`, nota).subscribe({
        next: (res) => {

          this.refrescarNotas();

          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });

    });
  }

  
  eliminarNota(id: string): Observable<any> {
    return new Observable(observer => {

      this.http.delete(`${this.apiUrl}/${id}.json`).subscribe({
        next: (res) => {

          this.refrescarNotas();

          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });

    });
  }

  /** Mueve una nota a la papelera (soft delete) */
  moverAPapelera(id: string, nota: any): Observable<any> {
    return new Observable(observer => {
      const notaPapelera: NotaPapelera = {
        titulo: nota.titulo,
        contenido: nota.contenido,
        fechaCreacion: nota.fechaCreacion,
        fechaActualizacion: nota.fechaActualizacion,
        fechaEliminacion: new Date().toISOString()
      };

      // 1. Guardar en /papelera
      this.http.post(`${this.papeleraUrl}.json`, notaPapelera).subscribe({
        next: () => {
          // 2. Eliminar de /notas
          this.http.delete(`${this.apiUrl}/${id}.json`).subscribe({
            next: (res) => {
              this.refrescarNotas();
              this.refrescarPapelera();
              observer.next(res);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /** Restaura una nota de la papelera a /notas */
  restaurarNota(id: string, nota: any): Observable<any> {
    return new Observable(observer => {
      const notaRestaurada: Nota = {
        titulo: nota.titulo,
        contenido: nota.contenido,
        fechaCreacion: nota.fechaCreacion,
        fechaActualizacion: new Date().toISOString()
      };

      // 1. Crear en /notas
      this.http.post(`${this.apiUrl}.json`, notaRestaurada).subscribe({
        next: () => {
          // 2. Eliminar de /papelera
          this.http.delete(`${this.papeleraUrl}/${id}.json`).subscribe({
            next: (res) => {
              this.refrescarNotas();
              this.refrescarPapelera();
              observer.next(res);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /** Elimina definitivamente una nota de la papelera */
  eliminarDefinitivamente(id: string): Observable<any> {
    return new Observable(observer => {
      this.http.delete(`${this.papeleraUrl}/${id}.json`).subscribe({
        next: (res) => {
          this.refrescarPapelera();
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /** Elimina automáticamente notas con más de 30 días en papelera */
  limpiarNotasExpiradas(): void {
    this.http.get(`${this.papeleraUrl}.json`).subscribe((data: any) => {
      if (!data) return;

      const ahora = new Date().getTime();
      const treintaDiasMs = 30 * 24 * 60 * 60 * 1000;

      Object.keys(data).forEach(id => {
        const nota = data[id];
        if (nota.fechaEliminacion) {
          const fechaEliminacion = new Date(nota.fechaEliminacion).getTime();
          if (ahora - fechaEliminacion > treintaDiasMs) {
            this.http.delete(`${this.papeleraUrl}/${id}.json`).subscribe();
          }
        }
      });

      // Refrescar después de limpiar
      setTimeout(() => this.refrescarPapelera(), 1000);
    });
  }

  /** Vacía toda la papelera */
  vaciarPapelera(): Observable<any> {
    return new Observable(observer => {
      this.http.delete(`${this.papeleraUrl}.json`).subscribe({
        next: (res) => {
          this.refrescarPapelera();
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}

