import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';
import { PaperBall } from '../../models/ball.model';
import { Coordenadas } from '../../models/coord.model';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy, AfterViewInit {
 
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
  @ViewChild('gameArea') gameAreaRef!: ElementRef;
  gameSize = { width: 0, height: 0 };
  intervalId: any;

  paperBalls: PaperBall[] = [];
  constructor(
    private socketService: SocketService,
    private readonly router: Router
  ) {}

  
  ngOnInit(): void {
    this.socketService.onUserLogged();
    this.socketService.onInit().subscribe(x => {
        this.revealed = x;
    })
    this.intervalId = setInterval(() => this.animateBalls2(), 16);

    this.askUserInfo();
    this.listenToUsers();
    this.listenToReveal();
    this.listenToReset();
    this.listenToThrowBall()
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  ngAfterViewInit() {
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
  }

  askUserInfo() {
    this.updateUserFromStorage();
    this.socketService.join(this.user);
    this.socketService.init();
  }

  listenToUsers() {
    this.socketService.onUsersUpdate().subscribe((users) => {
      this.users = users;
      this.distribuiUsers();
      this.updateAllVotedStatus();
    });
  }

  listenToReveal() {
    this.socketService.onReveal().subscribe(() => {
      this.revealed = true;
    });
  }
  listenToReset(){
    this.socketService.onReset().subscribe(() => {
      this.selectedCard = null;
      this.revealed = false;
    })
  }

  listenToThrowBall(){
    this.socketService.onThrowBall().subscribe(x => {
      this.throwPaperBall(x);
    })
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

  distribuiUsers(){
    this.topUsers = this.users.slice(0, 2);
    this.rightUsers = this.users.slice(3,4);
    this.bottomUsers = this.users.slice(5,6);
    this.leftUsers = this.users.slice(7,8);
  }

  updateUserFromStorage(){
     if (typeof localStorage != 'undefined') {
      const jsonuser = localStorage.getItem("poker-user");
      if(jsonuser)
        this.user = JSON.parse(jsonuser);
    }
  }
  logout() {
    if (typeof localStorage != 'undefined') {
      localStorage.removeItem("poker-user");
      this.router.navigate(['/'])
    }
  }

 

  updateSize() {
    const rect = this.gameAreaRef.nativeElement.getBoundingClientRect();
    this.gameSize = { width: rect.width, height: rect.height };
  }

  animateBalls() {
    this.paperBalls = this.paperBalls.map(ball => {
      if (ball.progress >= 1) {
        return { ...ball, isVisible: false };
      }

      const newProgress = ball.progress + 0.03;
      const t = newProgress;
      const curve = 4 * t * (1 - t); // curva parabólica

      const startX = this.gameSize.width;
      const startY = this.gameSize.height;

      const newX = startX + (ball.targetX - startX) * t;
      const newY = startY + (ball.targetY - startY) * t - curve * 100;

      return { ...ball, x: newX, y: newY, progress: newProgress };
    }).filter(ball => ball.isVisible || ball.progress < 1.2);
  }

  callThrowPaperBall( button: HTMLElement) {
    const rect = button.getBoundingClientRect();
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;

    const coord: Coordenadas = {
      x: ((rect.left + rect.width / 2) / pageWidth) * 100,
      y: ((rect.top) / pageHeight) * 100
    }
    this.socketService.throwBall(coord);
  }

  throwPaperBall(button: Coordenadas) {
    
    const x = button.x;
    const y = button.y;

    const targetX = this.gameSize.width * (x/100);
    const targetY = this.gameSize.height * (y/100);

    const newBall = {
      x: this.gameSize.width * 0.95,
      y: this.gameSize.height * y/100,
      targetX,
      targetY,
      fromPlayer: 0,
      progress: 0,
      isVisible: true,
    };

    this.paperBalls.push(newBall);
  }
    
  animateBalls2() {
    this.paperBalls = this.paperBalls.map(ball => {
      if (ball.progress >= 1 && !ball.impacting) {
        // Acabou de chegar no destino → iniciar efeito de impacto
        this.triggerImpactEffect(ball);
        return { ...ball, impacting: true }; // manter visível por mais 1 frame
      }

      if (ball.progress >= 1.1) {
        // depois de um curto tempo, remover
        return { ...ball, isVisible: false };
      }

      const newProgress = ball.progress + 0.03;
      const t = newProgress;
      const curve = 4 * t * (1 - t);

      const startX = this.gameSize.width * 0.95;
      const startY = this.gameSize.height * 0.5;

      const newX = startX + (ball.targetX - startX) * t;
      const newY = startY + (ball.targetY - startY) * t - curve * 100;

      return { ...ball, x: newX, y: newY, progress: newProgress };
    }).filter(ball => ball.isVisible || ball.progress < 1.2);
  }

  triggerImpactEffect(ball: PaperBall) {
    const ballId = `ball-${ball.fromPlayer}`;
    const el = document.getElementById(ballId);
    if (!el) return;

    let scale = 1;
    let step = 0.1;
    let count = 0;

    const interval = setInterval(() => {
      scale = count % 2 === 0 ? 1.2 : 0.9;
      el.style.transform = `translate(-50%, -50%) scale(${scale})`;

      count++;
      if (count >= 4) {
        clearInterval(interval);
        el.style.transform = `translate(-50%, -50%) scale(1)`;
      }
    }, 50);
  }

}