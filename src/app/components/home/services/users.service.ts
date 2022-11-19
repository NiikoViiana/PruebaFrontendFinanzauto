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

  getUsers(page: Number, limit: Number): Observable<any> {
    return  this.http.get(environment.apiUrl + `/data/v1/user/?page=${page}&limit=${limit}`)
            .pipe(
              map((response: any) => {
                return response;
              })
            );
  }

  getUsersById(idUser: User['id']): Observable<User> {
    return  this.http.get(environment.apiUrl + `/data/v1/user/${idUser}`)
            .pipe(
              map((response: any) => {
                let data: User = response;
                return data;
              })
            );
  }  
  
  createUser(user: User): Observable<User> {
    return  this.http.post(environment.apiUrl + `/data/v1/user/create`, user)
            .pipe(
              map((response: any) => {
                let data: User = response;
                return data;
              })
            );
  }  
  
  editUser(user: User): Observable<User> {
    return  this.http.put(environment.apiUrl + `/data/v1/user/${user.id}`, user)
            .pipe(
              map((response: any) => {
                let data: User = response;
                return data;
              })
            );
  }
}
