import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

/**
 * Components
 */
import { NavComponent } from './components/nav/nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './components/users/users.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFloppyDisk, faUserCheck, faUserPen, faUserPlus, faUserXmark, faXmark } from '@fortawesome/free-solid-svg-icons';


@NgModule({
  declarations: [    
    HomeComponent,
    NavComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FontAwesomeModule,
    HomeRoutingModule
  ],
  providers: [
      DecimalPipe
  ],
  bootstrap: [HomeComponent]
})
export class HomeModule {
  
  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIcons(
      faUserPen, 
      faUserPlus, 
      faUserXmark, 
      faUserCheck, 
      faFloppyDisk,
      faXmark
    );
  }
}
