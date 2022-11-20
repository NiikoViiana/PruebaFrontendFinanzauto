import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { async, map, Observable, startWith } from 'rxjs';
import { User } from 'src/app/components/home/models/user.model';
import { UsersService } from 'src/app/components/home/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  @ViewChild('modal') modal: NgbActiveModal | undefined;


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

  datosUsuario: User = {
    firstName: '',
    id: '',
    lastName: '',
    picture: '',
    title: '',
    gender: '',
    dateOfBirth: new Date()
  };

  mensaje: string = "";

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
    this.loading        =   true;
    this.listaUsuarios  =   await this.getUsers() as Array<User>;
    
    this.usuarios$ = this.filter.valueChanges.pipe(
			startWith(''),
			map((text) => this.searchInTable(text, this.pipe)),
		);

    this.loading        =   false;
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
        usuario.title.toLowerCase().includes(term) ||
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
    
    this.loading  = true;
    this.selectOption = option;
    this.modalService.open(content, { centered: true, scrollable: true });


    if(this.selectOption == 1 || this.selectOption == 3) {    
      
      this.submitted = false;

      this.tituloModal  = this.selectOption == 1 ? 'Crear ' : 'Editar ';
      this.tituloModal  = this.tituloModal + 'Usuario';
      
      this.formGroupUser   =   this.fb.group({
        firstName: ["", Validators.required],
        id: [""],
        lastName: ["", Validators.required],
        picture: ["", Validators.required],
        title: ["", Validators.required],
        genero: ["", Validators.required],
        email: ["", Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")],
        fechaNacimiento: [new Date().toLocaleDateString(), Validators.required],
        telefono: [0]
      });

      this.formGroupUser.reset();
      
      if(this.selectOption == 3) {
        let dataUser = await this.getUserById(idUser) as User;
        this.setDataUser(dataUser);
      }

    } else {
      let dataUser = await this.getUserById(idUser) as User;
      this.datosUsuario = dataUser;
    }

    this.loading  = false;
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
      console.log(this.formGroupUser);
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

    if(dataUser.id == "" || dataUser.id == null) {

      await this.createUser(dataUser).then(
        (response: User) => {
          this.mensaje  = `El usuario ${response.firstName} se creó correctamente`;
          this.setDataUser(response);
          this.selectOption = 3;
        }
      ).catch(
        error => {
          this.mensaje  = `Ha sucedido un error creando el usuario, contacte al administrador`;
          console.error("createUser", error);
        }
      ).finally(
        () => {
          this.submitted  =   false;
          this.loading    =   false;
          this.modalService.dismissAll();
          this.getData();
        }
      );

    } else {

      await this.editUser(dataUser).then(
        (response: User) => {
          this.mensaje  = `El usuario ${response.firstName} se editó correctamente`;
          this.setDataUser(response);
        }
      ).catch(
        error => {
          this.mensaje  = `Ha sucedido un error editando el usuario, contacte al administrador`;
          console.error("editUser", error);
        }
      ).finally(
        () => {
          this.submitted  =   false;
          this.loading    =   false;
          this.modalService.dismissAll();
          this.getData();
        }
      );
    }
    
  }

  async confirmDeleteUser(idUser: User['id']) {

    this.loading = true;
    
    await this.deleteUser(idUser).then(
      (response: User['id']) => {
        this.mensaje  = `El usuario se eliminó correctamente`;
      }
    ).catch(
      error => {
        this.mensaje  = `Ha sucedido un error eliminando el usuario, contacte al administrador`;
        console.error("deleteUser", error);
      }
    ).finally(
      () => {
        this.modalService.dismissAll();
        this.loading = false;
        this.getData();
      }
    );
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

  deleteUser(idUser: User['id']): Promise<User['id']> {
    return new Promise((resolve, reject) => {

      this.UsersService.deleteUser(idUser).subscribe({
        next: (data: User['id']) => {
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

  get fControls() { return this.formGroupUser.controls;  }

}
