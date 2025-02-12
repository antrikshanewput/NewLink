import { LoginDto, LoginSmsDto, VerifySmsDto } from 'dto/login.dto';
import { RegisterDto } from 'dto/register.dto';

export const DefaultDTO = [
	{
		provide: 'LOGIN_DTO',
		useValue: LoginDto,
	},
	{
		provide: 'REGISTER_DTO',
		useValue: RegisterDto,
	},
	{
		provide: 'LOGIN_SMS_DTO',
		useValue: LoginSmsDto,
	},
	{
		provide: 'VERIFY_SMS_DTO',
		useValue: VerifySmsDto,
	},
];
