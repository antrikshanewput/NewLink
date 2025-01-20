
import { LoginDto } from 'dto/login.dto';
import { RegisterDto } from 'dto/register.dto';

export const DefaultDTO = [
    {
        provide: 'LOGIN_DTO',
        useValue: LoginDto
    },
    {
        provide: 'REGISTER_DTO',
        useValue: RegisterDto
    }
];