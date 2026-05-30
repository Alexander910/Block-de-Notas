import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgxEditorModule, Editor } from 'ngx-editor';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    FormsModule,
    NgxEditorModule
  ],
  templateUrl: './editor.html',
  styleUrl: './editor.css'
})
export class EditorComponent implements OnInit, OnDestroy {

  editor!: Editor;

  html = '';

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
}