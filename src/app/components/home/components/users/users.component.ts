import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { async, BehaviorSubject, map, Observable, startWith } from 'rxjs';
import { User } from 'src/app/components/home/models/user.model';
import { UsersService } from 'src/app/components/home/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  listaUsuarios: Array<User> = [];  
  totalUsuarios: number = 0;
  usuarios$: Observable<User[]> | undefined;

  page: number = 1;
  limit: number = 6;
  filter = new FormControl('', { nonNullable: true });

  formGroupUser!: FormGroup;
  tituloModal: string = "";

  constructor(
    private UsersService: UsersService, 
    private pipe: DecimalPipe,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.getData();
  }

  ngOnInit(): void {    
  }

  async getData() {
    this.listaUsuarios  =   await this.getUsers() as Array<User>;
    
    this.usuarios$ = this.filter.valueChanges.pipe(
			startWith(''),
			map((text) => this.searchInTable(text, this.pipe)),
		);
  }

  getUsers(): Promise<Array<User>> {
    return new Promise(resolve => {

      this.UsersService.getUsers(this.page, this.limit).subscribe({
        next: (data: any) => {
          this.totalUsuarios = data.total;
          this.page = data.page;
          this.limit = data.limit;
          resolve(data.data);
        },
        error:  error => console.error(error)
      });

    });
  }

  searchInTable(text: string, pipe: PipeTransform): User[] {    
    return this.listaUsuarios.filter((usuario) => {
      const term = text.toLowerCase();
      return (
        usuario.id.toLowerCase().includes(term) ||
        usuario.firstName.toLowerCase().includes(term)||
        usuario.lastName.toLowerCase().includes(term)
      );
    });
  }

  refreshTable() {
    this.filter.setValue('');
    this.getData();
	}

  openModalUser(content: any, option: number) {
		this.modalService.open(content, { centered: true });

    this.tituloModal  = option == 1 ? 'Crear ' : option == 2 ? 'Detalle del ': 'Editar ';
    this.tituloModal  = this.tituloModal + 'Usuario';

    this.formGroupUser   =   this.fb.group({
      firstName: ["", Validators.required],
      id: ["", Validators.required],
      lastName: ["", Validators.required],
      picture: ["", Validators.required],
      title: ["", Validators.required],
      genero: ["", Validators.required],
      email: [""],
      fechaNacimiento: [new Date().toLocaleDateString()],
      telefono: [0]
    });

	}

}
