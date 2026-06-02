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

@Injectable({
  providedIn: 'root'
})
export class NotasService {

  private apiUrl =
    'https://notas-25009-default-rtdb.firebaseio.com/notas';

  private notasSubject = new BehaviorSubject<any[]>([]);
  notas$ = this.notasSubject.asObservable();

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

  obtenerNotas(): Observable<any> {
    return this.http.get(`${this.apiUrl}.json`);
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
}
