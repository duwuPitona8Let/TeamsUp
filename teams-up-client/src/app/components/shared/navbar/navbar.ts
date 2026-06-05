import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  UserRole = UserRole;

  constructor(public authService: AuthService) {}
}
