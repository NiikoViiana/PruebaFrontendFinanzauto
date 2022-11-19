import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { async, map, Observable, startWith } from 'rxjs';
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

  submitted: boolean = false;
  loading: boolean = false;

  selectOption: number = 0;

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

  async openModalUser(content: any, option: number, idUser: User['id']) {

    this.selectOption = option;
		this.modalService.open(content, { centered: true, scrollable: true });

    this.tituloModal  = this.selectOption == 1 ? 'Crear ' : this.selectOption == 2 ? 'Detalle del ': 'Editar ';
    this.tituloModal  = this.tituloModal + 'Usuario';

    this.formGroupUser   =   this.fb.group({
      firstName: ["", Validators.required],
      id: [""],
      lastName: ["", Validators.required],
      picture: ["", Validators.required],
      title: ["", Validators.required],
      genero: ["", Validators.required],
      email: [""],
      fechaNacimiento: [new Date().toLocaleDateString(), Validators.required],
      telefono: [0]
    });

    this.formGroupUser.reset();

    if(this.selectOption == 2 || this.selectOption == 3) { 

      let dataUser = await this.getUserById(idUser) as User;
      this.setDataUser(dataUser);

      if(this.selectOption == 2) {
        this.formGroupUser.disable();
      }
      
    }
	}

  getUserById(idUser: string): Promise<User> {
    return new Promise(resolve => {
      this.UsersService.getUsersById(idUser).subscribe({
        next: (data: User) => {
          resolve(data);
        },
        error:  error => console.error(error)
      });
    });
  }

  async onSubmit() {

    this.submitted  =   true;
    this.loading    =   true;

    if (this.formGroupUser.invalid) {
      this.loading    =   false;
      return;
    }

    let fecha         =   this.formGroupUser.get('fechaNacimiento')?.getRawValue();
    let nacimiento    =   new Date(`${fecha.year.toString()}-${fecha.month.toString()}-${fecha.day.toString()}`);

    let dataUser: User = {
      firstName: this.formGroupUser.get('firstName')?.getRawValue(),
      id: this.formGroupUser.get('id')?.getRawValue(),
      lastName: this.formGroupUser.get('lastName')?.getRawValue(),
      picture: this.formGroupUser.get('picture')?.getRawValue(),
      title: this.formGroupUser.get('title')?.getRawValue(),
      gender: this.formGroupUser.get('genero')?.getRawValue(),
      email: this.formGroupUser.get('email')?.getRawValue(),
      dateOfBirth: nacimiento,
      phone: this.formGroupUser.get('telefono')?.getRawValue()
    };

    console.log(dataUser);

    if(dataUser.id == "" || dataUser.id == null) {

      await this.createUser(dataUser).then(
        (response: User) => {
          console.log("OK creación", response);
          this.setDataUser(response);
          this.selectOption = 3;
        }
      ).catch(
        error => console.error("Sucedió un error al guardar", error)
      ).finally(
        () => {
          this.submitted  =   false;
          this.loading    =   false;
        }
      );

    } else {

      await this.editUser(dataUser).then(
        (response: User) => {
          console.log("OK edición", response)
          this.setDataUser(response);
        }
      ).catch(
        error => console.error("Sucedió un error al editar", error)
      ).finally(
        () => {
          this.submitted  =   false;
          this.loading    =   false;
        }
      );

    }
    this.getData();
  }

  createUser(dataUser: User): Promise<User> {
    return new Promise((resolve, reject) => {

      this.UsersService.createUser(dataUser).subscribe({
        next: (data: User) => {
          resolve(data);
        },
        error:  error => reject(error)
      });

    });
  }

  editUser(dataUser: User): Promise<User> {
    return new Promise((resolve, reject) => {

      this.UsersService.editUser(dataUser).subscribe({
        next: (data: User) => {
          resolve(data);
        },
        error:  error => reject(error)
      });

    });
  }

  setDataUser(dataUser: User): void {

    this.formGroupUser.get('firstName')?.setValue(dataUser.firstName);
    this.formGroupUser.get('id')?.setValue(dataUser.id);
    this.formGroupUser.get('lastName')?.setValue(dataUser.lastName);
    this.formGroupUser.get('picture')?.setValue(dataUser.picture);
    this.formGroupUser.get('title')?.setValue(dataUser.title);
    this.formGroupUser.get('genero')?.setValue(dataUser.gender);
    this.formGroupUser.get('email')?.setValue(dataUser.email);
    this.formGroupUser.get('fechaNacimiento')?.setValue({
      "year": new Date(dataUser.dateOfBirth).getFullYear(),
      "month": new Date(dataUser.dateOfBirth).getMonth()+1,
      "day": new Date(dataUser.dateOfBirth).getDay()+1
    });
    this.formGroupUser.get('telefono')?.setValue(dataUser.phone);
  }

  get fControls() { return this.formGroupUser.controls; }

}
