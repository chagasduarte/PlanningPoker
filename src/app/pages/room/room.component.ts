import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit {
 
  user!: User;
  users: User[] = [];
  topUsers: User[] = [];
  bottomUsers: User[] = [];
  leftUsers: User[] = [];
  rightUsers: User[] = []; 
  cards: string[] = ["PP", "P", "M", "G"];
  selectedCard: string | null = null;
  allVoted = false;
  revealed = false;

  constructor(
    private socketService: SocketService,
    private readonly router: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.socketService.onUserLogged();
    this.askUserInfo();
    this.listenToUsers();
    this.listenToReveal();
  }

  askUserInfo() {
    this.updateUserFromStorage();
    this.socketService.join(this.user);
  }

  listenToUsers() {
    this.socketService.onUsersUpdate().subscribe((users) => {
      this.users = users;
      this.distribuiUsers(users);
      this.updateAllVotedStatus();
    });
  }

  listenToReveal() {
    this.socketService.onReveal().subscribe(() => {
      this.revealed = true;
    });
  }
  
  vote(card: string) {
    this.updateUserFromStorage();
    this.selectedCard = card;
    if (this.user.role === 'observer') return;
    this.socketService.vote(this.user.id, card);
  }

  revealCards() {
    this.socketService.reveal();
  }

  resetVotes() {
    this.selectedCard = null;
    this.revealed = false;
    this.socketService.reset();
  }

  updateAllVotedStatus() {
    const voters = this.users.filter(u => u.role === 'voter');
    const voted = voters.filter(u => u.card !== undefined);
    this.allVoted = voters.length > 0 && voters.length === voted.length;
  }
  
  isCurrentUser(user: User): boolean {
    return user.id === this.user.id;
  }

  maskCard(card?: string): string {
    return this.revealed ? (card || '') : '🂠'; // 🂠 = carta virada
  }

  distribuiUsers(usuarios: User[]){
    this.topUsers = this.users.slice(0, 2);
    this.rightUsers = this.users.slice(2, 4);
    this.bottomUsers = this.users.slice(4, 6);
    this.leftUsers = this.users.slice(6, 8);
  }
  updateUserFromStorage(){
     if (typeof localStorage != 'undefined') {
      const jsonuser = localStorage.getItem("poker-user");
      if(jsonuser)
        this.user = JSON.parse(jsonuser);
    }
  }
}


