import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  constructor(private http: HttpClient) { }

  /**
   * Método GET que consume la API para consultar todos los usuarios dependiendo
   * de la página actual.
   * 
   * @param {number} page - Pagina que se desea consultar
   * @param {number} limit - Limite de datos que se quieren consultar.
   * @returns {any} Datos de los usuarios, y el conteo total de usuarios.
   */
  getUsers(page: Number, limit: Number): Observable<any> {
    return  this.http.get(environment.apiUrl + `/data/v1/user/?page=${page}&limit=${limit}`)
            .pipe(
              map((response: any) => {
                return response;
              })
            );
  }

  /**
   * Método GET que consume la API para consultar los datos del usuario dependiendo
   * de su id.
   * 
   * @param {number} idUser - Id del usuario
   * @returns {User} Datos del usuario consultado 
   */
  getUsersById(idUser: User['id']): Observable<User> {
    return  this.http.get(environment.apiUrl + `/data/v1/user/${idUser}`)
            .pipe(
              map((response: any) => {
                let data: User = response;
                return data;
              })
            );
  }  
  
  /**
   * Método POST que consume la API para insertar los datos de un nuevo usuario.
   * 
   * @param {User} user - Datos del usuario nuevo 
   * @returns {User} Datos del usuario insertado
   */
  createUser(user: User): Observable<User> {
    return  this.http.post(environment.apiUrl + `/data/v1/user/create`, user)
            .pipe(
              map((response: any) => {
                let data: User = response;
                return data;
              })
            );
  }  
  
  /**
   * Método PUT que consume la API para editar los datos de un usuario registrado.
   * 
   * @param {User} user - Datos del usuario nuevo 
   * @returns {User} Datos del usuario insertado
   */
  editUser(user: User): Observable<User> {
    return  this.http.put(environment.apiUrl + `/data/v1/user/${user.id}`, user)
            .pipe(
              map((response: any) => {
                let data: User = response;
                return data;
              })
            );
  } 
  
  /**
   * Método DEL que consume la API para eliminar el usuario dependiendo de su id.
   * 
   * @param {number} idUser - Id del usuario
   * @returns {User.id} Id del usuario eliminado
   */
  deleteUser(idUser: User['id']): Observable<User['id']> {
    return  this.http.delete(environment.apiUrl + `/data/v1/user/${idUser}`)
            .pipe(
              map((response: any) => {
                let data: User['id'] = response;
                return data;
              })
            );
  }
}
