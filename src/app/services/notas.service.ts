import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';  
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

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

    private notaSeleccionadaSource = new BehaviorSubject<any>(null);

    notaSeleccionada$ = this.notaSeleccionadaSource.asObservable();

    seleccionarNota(nota: any): void {
    this.notaSeleccionadaSource.next(nota);
}

   constructor(private http: HttpClient) {}

  obtenerNotas(): Observable<any> {
    return this.http.get(`${this.apiUrl}.json`);
  }

  crearNota(nota: Nota): Observable<any> {
    return this.http.post(`${this.apiUrl}.json`, nota);
  }

  actualizarNota(id: string, nota: Nota): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}.json`, nota);
  }

  eliminarNota(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}.json`);
  }
}
