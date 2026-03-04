import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../service/user.service";
import { UserListComponent } from "./user-list/user-list.component";

@Component({
  standalone: true,
  imports: [
    FormsModule,
    UserListComponent
  ],
  providers: [UserService],
  template: `<user-list />`
})
export class UserPage { }
