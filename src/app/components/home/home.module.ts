import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

/**
 * Components
 */
import { NavComponent } from '../nav/nav.component';


@NgModule({
  declarations: [
    HomeComponent,
    NavComponent
  ],
  imports: [
    HomeRoutingModule
  ],
  bootstrap: [HomeComponent]
})
export class HomeModule { }
