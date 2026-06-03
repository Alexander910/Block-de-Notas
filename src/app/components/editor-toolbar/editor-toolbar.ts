import { Component, Input, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from 'ngx-editor';
import { setBlockType } from 'prosemirror-commands';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editor-toolbar.html',
  styleUrl: './editor-toolbar.css'
})
export class EditorToolbarComponent implements OnInit, OnDestroy {
  @Input() editor!: Editor;

  fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Trebuchet MS', 'Impact'];

  isFontMenuOpen = false;
  isHeadingMenuOpen = false;
  isAlignMenuOpen = false;
  isTextColorOpen = false;
  isBgColorOpen = false;

  currentFont = 'Arial';
  currentHeading = 'Normal';
  currentAlign = 'left';
  currentTextColor = '#000000';
  currentBgColor = '#ffff00';

  // HSV state for text color picker
  textHue = 0;
  textSatVal = { s: 100, v: 0 };

  // HSV state for background color picker
  bgHue = 60;
  bgSatVal = { s: 100, v: 100 };

  private updateSubscription!: Subscription;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.updateSubscription = this.editor.update.subscribe(() => {
      this.updateState();
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllMenus();
    }
  }

  closeAllMenus() {
    this.isFontMenuOpen = false;
    this.isHeadingMenuOpen = false;
    this.isAlignMenuOpen = false;
    this.isTextColorOpen = false;
    this.isBgColorOpen = false;
  }

  updateState() {
    const { state } = this.editor.view;
    const { selection } = state;
    const marks = selection.$from.marks();

    const fontMark = marks.find(m => m.type.name === 'font_family');
    this.currentFont = fontMark ? fontMark.attrs['family'] : 'Arial';

    const textColorMark = marks.find(m => m.type.name === 'text_color');
    if (textColorMark) this.currentTextColor = textColorMark.attrs['color'];

    const bgColorMark = marks.find(m => m.type.name === 'text_background_color');
    if (bgColorMark) this.currentBgColor = bgColorMark.attrs['backgroundColor'];

    const node = selection.$from.parent;
    if (node.type.name === 'heading') {
      this.currentHeading = `H${node.attrs['level']}`;
    } else {
      this.currentHeading = 'Normal';
    }
    this.currentAlign = node.attrs['align'] || 'left';
  }

  // ── Toggle menus ──
  toggleMenu(menu: string, e: Event) {
    e.stopPropagation();
    const wasOpen = (this as any)[menu];
    this.closeAllMenus();
    if (!wasOpen) (this as any)[menu] = true;
  }

  // ── Font ──
  setFont(font: string) {
    this.currentFont = font;
    this.isFontMenuOpen = false;
    const { state, dispatch } = this.editor.view;
    const markType = state.schema.marks['font_family'];
    if (!markType) return;
    const { tr, selection } = state;
    if (selection.empty) {
      dispatch(tr.addStoredMark(markType.create({ family: font })));
    } else {
      dispatch(tr.addMark(selection.from, selection.to, markType.create({ family: font })));
    }
  }

  // ── Heading ──
  setHeading(level: number | null) {
    this.isHeadingMenuOpen = false;
    const { state, dispatch } = this.editor.view;
    const { schema } = state;
    if (level === null) {
      setBlockType(schema.nodes['paragraph'])(state, dispatch);
    } else {
      setBlockType(schema.nodes['heading'], { level })(state, dispatch);
    }
  }

  // ── Align ──
  setAlign(align: string) {
    this.currentAlign = align;
    this.isAlignMenuOpen = false;
    const { state, dispatch } = this.editor.view;
    const { doc, selection, tr, schema } = state;
    const { from, to } = selection;
    let applicable = false;
    doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === schema.nodes['paragraph'] || node.type === schema.nodes['heading']) {
        applicable = true;
        tr.setNodeMarkup(pos, null, { ...node.attrs, align });
      }
      return true;
    });
    if (applicable) dispatch(tr);
  }

  // ── Color Picker ──
  getHueColor(hue: number): string {
    return this.hsvToHex(hue, 100, 100);
  }

  onSvSquareClick(event: MouseEvent, type: 'text' | 'bg') {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
    const s = (x / rect.width) * 100;
    const v = 100 - (y / rect.height) * 100;

    if (type === 'text') {
      this.textSatVal = { s, v };
      this.currentTextColor = this.hsvToHex(this.textHue, s, v);
    } else {
      this.bgSatVal = { s, v };
      this.currentBgColor = this.hsvToHex(this.bgHue, s, v);
    }
  }

  onHueBarClick(event: MouseEvent, type: 'text' | 'bg') {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const hue = (x / rect.width) * 360;

    if (type === 'text') {
      this.textHue = hue;
      this.currentTextColor = this.hsvToHex(hue, this.textSatVal.s, this.textSatVal.v);
    } else {
      this.bgHue = hue;
      this.currentBgColor = this.hsvToHex(hue, this.bgSatVal.s, this.bgSatVal.v);
    }
  }

  applyTextColor() {
    this.isTextColorOpen = false;
    const { state, dispatch } = this.editor.view;
    const markType = state.schema.marks['text_color'];
    if (!markType) return;
    const { tr, selection } = state;
    if (selection.empty) {
      dispatch(tr.addStoredMark(markType.create({ color: this.currentTextColor })));
    } else {
      dispatch(tr.addMark(selection.from, selection.to, markType.create({ color: this.currentTextColor })));
    }
  }

  applyBgColor() {
    this.isBgColorOpen = false;
    const { state, dispatch } = this.editor.view;
    const markType = state.schema.marks['text_background_color'];
    if (!markType) return;
    const { tr, selection } = state;
    if (selection.empty) {
      dispatch(tr.addStoredMark(markType.create({ backgroundColor: this.currentBgColor })));
    } else {
      dispatch(tr.addMark(selection.from, selection.to, markType.create({ backgroundColor: this.currentBgColor })));
    }
  }

  hsvToHex(h: number, s: number, v: number): string {
    s /= 100;
    v /= 100;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60)       { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else              { r = c; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // ── Image Upload ──
  triggerImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const src = event.target.result;
          const { state, dispatch } = this.editor.view;
          const { schema, tr } = state;
          const imageNode = schema.nodes['image'].create({ src, alt: file.name });
          dispatch(tr.replaceSelectionWith(imageNode));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
}
