import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, Observable, delay, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import {HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static readonly UsersStorageKey = 'users';

  private currentUser!: User | null;
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private users: User[] = [];
  private filteredUsers: User[] = [];
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private lengthUsersSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  users$: Observable<User[]> = this.usersSubject.asObservable();
  lengthUsers$: Observable<number> = this.lengthUsersSubject.asObservable();
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http:HttpClient,  private storageService: LocalStorageService, private router: Router) {}

  fetchDataFromLocalStorage() {
    // this.users = this.storageService.getValue<User[]>(UserService.UsersStorageKey) || [];
    this.http.get<User[]>('https://64c75f330a25021fde92604d.mockapi.io/api/v1/users').subscribe((data) => {
      console.log("Data", data);

      this.users = data
      this.filteredUsers = [...this.users];
      this.currentUser = this.storageService.getValue<User>('currentUser') || null;
      this.updateData();
    });

  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>('https://64c75f330a25021fde92604d.mockapi.io/api/v1/users')
  }

  delete(userId: number): Observable<User[]> {
    return this.http.delete<User[]>(`https://64c75f330a25021fde92604d.mockapi.io/api/v1/users/${userId}`)
  }

  updateToLocalStorage() {
    this.storageService.setObject(UserService.UsersStorageKey, this.users);
    this.filterUsers(null, false);
    this.updateData();
  }

  importDataFromFile(users: User[]) {
    this.users = users;
    this.updateToLocalStorage();
  }

  add(username: string, password: string, firstName: string, lastName: string): Observable<User[]> {
    let user = {
      username: username,
      password: password,
      firstName: firstName,
      lastName: lastName
    }
    return this.http.post<User[]>(`https://64c75f330a25021fde92604d.mockapi.io/api/v1/users`, user);
  }

  addUser(username: string, password: string, firstName: string, lastName: string): Boolean {
    const user = this.users.find((user) => user.username === username);
    if (user) {
      return false;
    } else {
      const id = new Date(Date.now()).getTime();
      const newUser = new User(id, username, password, firstName, lastName);
      this.users.unshift(newUser);
      this.updateToLocalStorage();
      return true;
    }
  }

  updateUser(id: number, data: User) {
    const index = this.users.findIndex((user) => user.id === id);
    this.users.splice(index, 1, data);
    this.updateToLocalStorage();
  }

  update(id: number, data: User) {
    console.log("User", data);
    console.log("id", id);
    return this.http.put<User>(`https://64c75f330a25021fde92604d.mockapi.io/api/v1/users/${id}`, data)
  }

  deleteUser(id: number) {
    const index = this.users.findIndex((user) => user.id === id);
    this.users.splice(index, 1);
    this.updateToLocalStorage();
  }

  getById(id: number): Observable<User | null> {
    return this.http.get<User>(`https://64c75f330a25021fde92604d.mockapi.io/api/v1/users/${id}`)
  }

  getUserByID(id: number): Observable<User | null> {
    let user = this.users.find((user) => user.id === id) || null;
    return of(user).pipe(delay(500));
  }

  filterUsers(key: string | null, isFiltering: boolean = true) {
    if (key) {
      this.filteredUsers = this.users.filter((user) => user.username.toLowerCase().includes(key.toLowerCase()));
    } else {
      this.filteredUsers = [...this.users];
    }
    if (isFiltering) {
      this.updateData();
    }
  }
  filter(key: string | null, isFiltering: boolean = true) {
    if (key) {
      // this.filteredUsers = this.users.filter((user) => user.username.toLowerCase().includes(key.toLowerCase()));
      this.http.get<User[]>(`https://64c75f330a25021fde92604d.mockapi.io/api/v1/users?search=${key}`).subscribe((datas) => {
        console.log("Data search", datas);
        this.filteredUsers = datas;
        if (this.filteredUsers != null) {
          this.updateData();
        }
      })
    } else {
      console.log("No filter", this.users);

      this.filteredUsers = [...this.users];
      this.updateData();
    }

  }

  login(username: string, password: string): Boolean {
    console.log("Users login", this.users);

    const user = this.users.find((user) => user.username === username && user.password === password);
    console.log(user);
    if (!user) {
      return false;
    } else {
      this.storageService.setObject('currentUser', user);
      this.currentUser = user;
      this.currentUserSubject?.next(this.currentUser);
      this.router.navigate(['']);
      return true;
    }
  }

  logout() {
    this.currentUser = null;
    this.currentUserSubject.next(this.currentUser);
    this.storageService.remove('currentUser');
    this.router.navigate(['/account/login']);
  }

  updateData() {
    this.currentUserSubject?.next(this.currentUser);
    this.usersSubject.next(this.filteredUsers);
    this.lengthUsersSubject.next(this.users.length);
  }
}
