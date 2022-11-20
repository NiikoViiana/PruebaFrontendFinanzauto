import { Component, OnInit, ViewChild } from '@angular/core';
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
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.getData();
  }

  ngOnInit(): void {    
  }
  
  /**
   * Método asíncrono que permite la consulta de los usuarios iniciales
   * asi como los datos filtrados para el 'observer' de usuarios, al momento de realizar el filtro de búsqueda en la tabla.
   * Mientras se realiza la carga, se activa la variable de 'loading' para ejecutar el 'spinner' mientras se consultan los datos.
   *
   * @property {boolean} UsersComponent.loading - Indicador para activar o desactivar 
   * el 'spinner' en la vista
   * @property {Array<User>} UsersComponent.listaUsuarios - Lista de los usuarios 
   * que se encuentran registrados
   * @property {Observable<User[]>} UsersComponent.usuarios - Observable que contiene 
   * los usuarios, se activa cuando existe un cambio en el filtro de la tabla
   * @property {FormControl<string>} UsersComponent.filter - Contiene el texto del input buscar 
   * de la tabla
   */
  async getData(): Promise<void> {
    this.loading        =   true;
    this.listaUsuarios  =   await this.getUsers() as Array<User>;
    
    this.usuarios$ = this.filter.valueChanges.pipe(
			startWith(''),
			map((text) => this.searchInTable(text)),
		);

    this.loading        =   false;
  }

  /**
   * Promesa que realiza la consulta del servicio de {@link UsersService | users.service.ts}
   * para obtener todos los usuarios dependiendo de la pagina seleccionada
   * Este método consulta los usuarios y los retorna al método asíncrono {@link getData() | async getData()}
   * 
   * En caso de no consultar los datos, imprime el error en consola
   * 
   * @property {number} UsersComponent.page - Numero de la pagina en la que se encuentre la tabla
   * @property {number} UsersComponent.limit - Limite de usuarios que se visualizan en la tabla
   * @property {number} UsersComponent.totalUsuarios - Cantidad total de usuarios registrados en la BD
   * 
   * @returns {Promise<Array<User>>} Lista de los usuarios que se encuentran registrados en la BD
   */
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
  
  /**
   * Método para realizar el filtro de los usuarios, dependiendo de lo que se escriba en el buscador de la tabla.
   * Se usa el método 'filter' del array de usuarios dependiendo del texto que se le pase en los parámetros 
   * 
   * @param {string} text - Texto que se escribe en el buscador de la tabla
   * @returns {Array<User>} Lista de usuarios filtrado por el texto dado
   */
  searchInTable(text: string): User[] {    
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

  /**
   * Método que usa el paginador para refrescar los datos de la tabla, dependiendo de la pagina seleccionada.
   * Limpia el buscado de la tabla y redirige a la función de {@link getData() | async getData()} para consultar
   * los nuevos datos de la tabla.
   * 
   * @property {FormControl<string>} UsersComponent.filter - Contiene el texto del input buscar de la tabla
   */
  refreshTable(): void {
    this.filter.setValue('');
    this.getData();
	}

  /**
   * Método asíncrono que abre el modal de usuarios.
   * 
   * Este modal se usa para la creación y edición de usuarios.
   * Si es para la creación de usuarios, se limpia el formulario dejando los campos vacíos.
   * Si es para la edición de usuarios, se consultan los datos del usuario y
   * se insertan en el formulario.
   * 
   * @property {boolean} UsersComponent.loading - Indicador para activar o desactivar 
   * el 'spinner' en la vista.
   * 
   * @property {boolean} UsersComponent.selectOption - Indicador para saber si es 
   * (1)Creación de usuario o (3)Edición de usuario.
   * 
   * @property {NgbModal} UsersComponent.modalService - Servicio que permite hacer las
   * interacciones con el modal, como lo es la de abrir dependiendo de la referencia que
   * se le envié.
   * 
   * @property {boolean} UsersComponent.submitted - Indicador para saber si los 
   * datos del formulario fueron o no enviados, con el fin de mostrar los mensajes de validaciones.
   * 
   * 
   * @param {any} content - Referencia del modal que se quiere abrir.
   * @param {number} option - Indicador para saber si se realizo la acción de crear o editar.
   * @param {User.id} idUser - Id del usuario que se desea consultar si se desea 
   * editar el usuario.
   */
  async openModalUser(content: any, option: number, idUser: User['id']): Promise<void> {
    
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

  /**
   * Promesa que realiza la consulta del servicio de {@link UsersService.getUsersById() | getUsersById()}
   * para obtener el usuario dependiendo del id enviado
   * 
   * Este método consulta el usuario y los retorna al método asíncrono {@link openModalUser() | async openModalUser()}
   * 
   * 
   * En caso de no consultar los datos, imprime el error en consola
   * 
   * @param {User.id} idUser - Id del usuario que se desea consultar
   * @returns {Promise<User>} - Datos del usuario registrado en la BD
   */
  getUserById(idUser: User['id']): Promise<User> {
    return new Promise(resolve => {
      this.UsersService.getUsersById(idUser).subscribe({
        next: (data: User) => {
          resolve(data);
        },
        error:  error => console.error(error)
      });
    });
  }

  /**
   * Método asíncrono que permite guardar los datos del formulario.
   * 
   * Si el id del usuario viene vació, se asume que es una creación, si viene con un dato, es
   * para una actualización.
   * En ambos casos, se envia un mensaje indicando la inserción o actualización de los datos.
   * 
   * @property {boolean} UsersComponent.submitted - Indicador para saber si los 
   * datos del formulario fueron o no enviados, con el fin de mostrar los mensajes 
   * de validaciones.
   * 
   * @property {boolean} UsersComponent.loading - Indicador para activar o desactivar 
   * el 'spinner' en la vista.
   * 
   * @property {FormGroup<any>} UsersComponent.formGroupUser - FormGroup que contiene
   * todos los datos del formulario.
   * 
   * Para la fecha de nacimiento, el datepicker envía los datos como un objeto que contiene
   * año, mes y dia, por lo tanto es necesario castearlo al tipo Date para poderlo enviar
   * al servicio de guardado.
   */
  async onSubmit(): Promise<void> {

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

  /**
   * Método asíncrono que se ejecuta cuando se confirma la eliminación de un usuario.
   * 
   * Una vez realizada la eliminación se envía el mensaje exitoso. EN caso de fallar,
   * se notifica y se imprime el error en consola.
   * 
   * @property {boolean} UsersComponent.loading - Indicador para activar o desactivar 
   * el 'spinner' en la vista.
   * 
   * @param {User.id} idUser - Id del usuario que se desea eliminar
   */
  async confirmDeleteUser(idUser: User['id']): Promise<void> {

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

  /**
   * Promesa que realiza la inserción en el servicio de {@link UsersService.createUser() | createUser()}
   * dependiendo de los datos enviados en el formulario.
   * 
   * Este método inserta el usuario y los retorna los datos 
   * al método asíncrono {@link onSubmit() | async onSubmit()}
   * 
   * 
   * En caso de no insertar los datos, retorna el error de inserción
   * 
   * @param {User} dataUser - Datos del usuario registrados en el formulario
   * @returns {Promise<User>} - Datos del usuario registrado en la BD
   */
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

  /**
   * Promesa que realiza la edición en el servicio de {@link UsersService.editUser() | editUser()}
   * dependiendo de los datos enviados en el formulario.
   * 
   * Este método actualiza el usuario y los retorna los datos 
   * al método asíncrono {@link onSubmit() | async onSubmit()}
   * 
   * 
   * En caso de no actualizar los datos, retorna el error de edición
   * 
   * @param {User} dataUser - Datos del usuario registrados en el formulario
   * @returns {Promise<User>} - Datos del usuario registrado en la BD
   */
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

  /**
   * Promesa que realiza la eliminación en el servicio de {@link UsersService.deleteUser() | deleteUser()}
   * dependiendo del id del usuario enviado.
   * 
   * Este método elimina el usuario y los retorna la datos 
   * al método asíncrono {@link confirmDeleteUser() | async confirmDeleteUser()}
   * 
   * 
   * En caso de no eliminar los datos, retorna el error de eliminación
   * 
   * @param {User.id} idUser - Id del usuario que se desea eliminar
   * @returns {Promise<User.id>} - Datos del usuario eliminado en la BD
   */
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

  /**
   * Método que permite establecer los datos del usuario en el FormGroup del formulario
   * de creación y edición.
   * 
   * Este método se usa en el método asíncrono 
   * {@link openModalUser() | async openModalUser()}
   * 
   * @param {User} dataUser - Datos del usuario consultado. 
   */
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

  /**
   * Getter que permite retornar los métodos de control del FormGroup
   * para realizar las validaciones en la vista del formulario.
   * 
   * @return {FormGroup.controls} Métodos del FormGroup
   */
  get fControls() { return this.formGroupUser.controls;  }

}
