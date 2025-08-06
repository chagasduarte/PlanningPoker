import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;
  private readonly SERVER_URL = 'https://planningpoker-api-pxer.onrender.com/';

  constructor() {
    this.socket = io(this.SERVER_URL);
  }

  join(user: User) {
    this.socket.emit('join', user);
  }

  vote(id: string, card: string) {
    this.socket.emit('vote', { id, card });
  }

  reveal() {
    this.socket.emit('reveal');
  }

  reset() {
    this.socket.emit('reset');
  }
  
  onUserLogged(): void {
    this.socket.on('userInfo', (user: User) => {
      if (typeof localStorage != 'undefined') {
        localStorage.setItem('poker-user', JSON.stringify(user));
        console.log(user);
      }
    })
  }

  onUsersUpdate(): Observable<User[]> {
    return new Observable((observer) => {
      this.socket.on('updateUsers', (users: User[]) => {
        observer.next(users);
      });
    });
  }

  onReveal(): Observable<void> {
    return new Observable<void>((observer) => {
      const handler = () => observer.next();

      this.socket.on('revealCards', handler);

      return () => {
        this.socket.off('revealCards', handler);
      };
    });
  }

  onReset(): Observable<void> {
     return new Observable<void>((observer) => {
      const handler = () => observer.next();

      this.socket.on('resetCard', handler);

      return () => {
        this.socket.off('resetCard', handler);
      };
    });
  }
}
