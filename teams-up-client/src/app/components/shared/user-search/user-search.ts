import { Component, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-search.html',
  styleUrl: './user-search.scss',
})
export class UserSearch {
  placeholder = input<string>('Поиск пользователя...');
  selectedUser = output<User | null>();

  searchQuery = signal('');
  users = signal<User[]>([]);
  showResults = signal(false);
  isLoading = signal(false);
  focused = signal(false);

  private searchSubject = new Subject<string>();

  constructor(private userService: UserService) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading.set(true)),
        switchMap((query) => this.userService.searchUsers(query)),
      )
      .subscribe({
        next: (results) => {
          this.users.set(results);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.users.set([]);
        },
      });
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);

    if (target.value.length >= 2) {
      this.searchSubject.next(target.value);
      this.showResults.set(true);
    } else {
      this.users.set([]);
      this.showResults.set(false);
    }
  }

  selectUser(user: User) {
    this.searchQuery.set(user.name + ' (' + user.email + ')');
    this.showResults.set(false);
    this.selectedUser.emit(user);
  }

  clearSelection() {
    this.searchQuery.set('');
    this.users.set([]);
    this.showResults.set(false);
    this.selectedUser.emit(null);
  }

  onFocus() {
    this.focused.set(true);
    if (this.searchQuery().length >= 2) {
      this.showResults.set(true);
    }
  }

  onBlur() {
    this.focused.set(false);
    setTimeout(() => this.showResults.set(false), 200);
  }
}
