import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthenticateService } from '../../../../shared/services/authenticate.service';
import { GameService } from './../../services/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public modalLoginIsVisible: boolean = false;
  public loginForm: FormGroup;
  private isLoading: boolean = false;

  constructor(
    private gameService: GameService,
    private formBuilder: FormBuilder,
    private authService: AuthenticateService,
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.minLength(6), Validators.required]]
    })
  }

  openModal() {
    this.modalLoginIsVisible = true;
  }

  handleLogin(loginForm: FormGroup, isLogin: boolean) {
    if (loginForm.valid) {
      const { email, password } = loginForm.getRawValue();
      this.isLoading = true;
      if (isLogin) {
        this.login(email, password);
      }
      else {
        this.createUser(email, password);
      }
    }
  }

  async createUser(email: string, password: string) {
    try {
      const { user } = await this.authService.register(email, password);
      await this.authService.setUserInList(user);
      this.modalLoginIsVisible = false;
    } catch (error) {
      console.log('Deu ruim irmao', error);
    }
    finally {
      this.isLoading = false;
    }
  }
  //é bom dividir as funcoes com responsabilidades, login sempre sera login, mas se for nescessario colocar algo a amsi ao criar um usuario
  //é facil colocar sem mudar a funcionalidade do login (por isso não colocar um boole tipo, isCreate)
  async login(email: string, password: string) {
    try {
      const { user } = await this.authService.login(email, password);
      await this.authService.setUserInList(user);
      this.modalLoginIsVisible = false;
    } catch (error) {
      console.log('Deu ruim irmao', error);
    }
    finally {
      this.isLoading = false;
    }
  }
}
