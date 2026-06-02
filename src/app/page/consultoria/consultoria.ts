import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultoria',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './consultoria.html',
  styleUrl: './consultoria.css'
})
export class Consultoria {

  textoOriginal = '';
  resultado = '';

  parafrasear(): void {

    this.resultado =
      'Texto parafraseado: ' + this.textoOriginal;

  }

  resumir(): void {

    this.resultado =
      this.textoOriginal.substring(0, 100) + '...';

  }

}