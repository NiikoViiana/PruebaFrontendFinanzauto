import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  listaUsuarios: Array<User> = [];
  page: Number = 1;
  limit: Number = 6;  

  usuarios$: Observable<User[]> | undefined;

  formFilter = new FormGroup({
    first: new FormControl('', { nonNullable: true }),
  });


  constructor(private UsersService: UsersService, pipe: DecimalPipe) {
    this.usuarios$ = this.formFilter.get('filter')?.valueChanges.pipe(
			startWith(''),
			map((text) => this.search(text, pipe)),
		);
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {

    this.UsersService.getUsers(this.page, this.limit).subscribe({
      next: (data: Array<User>) => {
        this.listaUsuarios = data;
      },
      error:  error => console.error(error)
    });

  }

  search(text: string, pipe: PipeTransform): User[] {
    console.log("entra");
    return this.listaUsuarios.filter((usuario) => {
      const term = text.toLowerCase();
      return (
        usuario.id.toLowerCase().includes(term) ||
        pipe.transform(usuario.firstName).includes(term) ||
        pipe.transform(usuario.lastName).includes(term)
      );
    });
  }

}
