import { Component, OnInit } from '@angular/core';
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

}