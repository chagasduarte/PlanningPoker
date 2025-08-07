import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  name = '';
  user!: User;
  selectedRole!: 'voter' | 'observer';

  @Output() roleSelected = new EventEmitter<'voter' | 'observer'>();
  constructor(private router: Router) {
    this.selectedRole = 'voter';
  }
  ngOnInit(): void {
    if (typeof localStorage != 'undefined') {
      const jsonuser = localStorage.getItem("poker-user");
      if(jsonuser){
        this.router.navigate(['/room']);
      }
    }
  }

  enterRoom() {
    if (this.name == ""){
      this.name = "Desmamado";
    }
    if (typeof localStorage != 'undefined') {
      this.user = {
        id: "",
        name: this.name,
        role: this.selectedRole
      }
      
      localStorage.setItem('poker-user', JSON.stringify(this.user));
    }
    this.router.navigate(['/room'] );
  }

  selectRole(role: 'voter' | 'observer') {
    this.selectedRole = role;
  }
}


