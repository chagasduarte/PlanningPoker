import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  name = '';
  isObserver = false;
  user!: User;


  constructor(private router: Router) {}
  ngOnInit(): void {
    if (typeof localStorage != 'undefined') {
      const jsonuser = localStorage.getItem("poker-user");
      if(jsonuser){
        this.router.navigate(['/room']);
      }
    }
  }

  enterRoom() {
    if (typeof localStorage != 'undefined') {
      this.user = {
        id: "",
        name: this.name,
        role: this.isObserver? "observer" : "voter"
      }

      localStorage.setItem('poker-user', JSON.stringify(this.user));
    }
    this.router.navigate(['/room'] );
  }
}
