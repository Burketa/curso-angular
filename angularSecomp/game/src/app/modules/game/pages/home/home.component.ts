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
  public gameId$: Observable<string>;
  public gameData$: Observable<number[]>;

  constructor(
    private gameService: GameService,
    private formBuilder: FormBuilder,
    private authService: AuthenticateService,
  ) { }

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.minLength(6), Validators.required]]
    });

    //Obter usuario logado
    const user = await this.authService.user$.pipe(take(1)).toPromise();
    //salvar o id do jogo atual dele
    this.gameId$ = this.gameService.getCurrentGameId(user.uid);
    //id do jogo atual
    const gameId = await this.gameId$.pipe(take(1)).toPromise();

    //se existir um id de jogo atual...
    if (gameId) {
      this.gameData$ = this.gameService.getGameData(gameId);
    }

    this.gameService.searchPlayer().subscribe(players => {
      console.log(players);
      const availablePlayer = players.find(player => player.isAvailable);

      if(availablePlayer)
      {
        const newGameId = this.gameService.generateGameId();
        this.gameService.createGame(user.uid, availablePlayer.user, newGameId);

        this.gameService.updateUserWithCreatedGame(user.uid, newGameId);
        this.gameService.updateUserWithCreatedGame(availablePlayer.user, newGameId);
      }
    });
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
  
  async userSelectIndex(indexSelected: number) {
    const user = await this.authService.user$.pipe(take(1)).toPromise();
    const gameId = await this.gameId$.pipe(take(1)).toPromise();

    try {
      await this.gameService.setUserPlay(indexSelected, user.uid, gameId);
    } catch (error) {
      console.log(error);
    }
  }

}
