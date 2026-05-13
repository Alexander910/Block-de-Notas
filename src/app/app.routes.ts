import { Routes } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { SidebarComponent } from './components/sidebar/sidebar';

export const routes: Routes = [
    {path: 'navbar', component: NavbarComponent},
    {path: 'sidebar', component: SidebarComponent},
];
