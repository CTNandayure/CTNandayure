import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInstitutionalInfoDto } from './dto/update-institutional-info.dto';

// InstitutionalInfo is a singleton resource — one row per site, always id 1.
const SINGLETON_ID = 1;

const DEFAULTS = {
  id: SINGLETON_ID,
  aboutTitle: 'Una cámara para un cantón que empezó de cero',
  aboutText:
    'La Cámara de Turismo Rural y Comunitario de Nandayure reúne a los negocios turísticos de los seis distritos del cantón —hospedaje, alimentación, transporte, artesanía y tours— para promover a Nandayure como destino y ayudar a cada visitante a encontrar lo que ofrece, distrito por distrito.',
  historyText:
    'En 1910 el Gobierno impulsó una colonia agrícola en el sur de Guanacaste con familias venidas de Atenas, San Ramón y Palmares. Con el tiempo, colonos de Cartago se sumaron a las familias guanacastecas ya asentadas en lugares como Santa Rita, y esa mezcla fue dando forma a la identidad que todavía distingue al cantón.\n\nEl 9 de octubre de 1961, bajo el gobierno de Mario Echandi Jiménez, la Ley N.º 2826 separó a Carmona del cantón de Nicoya y creó el cantón número nueve de Guanacaste: Nandayure. La decisión se confirmó por plebiscito el 4 de febrero de 1962, y el nuevo Concejo sesionó por primera vez el 8 de abril de ese mismo año. Carmona quedó como cabecera del cantón, posición que conserva hoy.',
  missionText:
    'Impulsar un turismo ordenado y con arraigo local en Nandayure, apoyando a los negocios afiliados de los seis distritos y ofreciendo a cada visitante información clara y confiable sobre qué hacer y dónde hacerlo.',
  visionText:
    'Ser el punto de referencia del turismo en Nandayure: un cantón reconocido por sus playas protegidas, su comunidad artística y una red de negocios locales sólida y visible para quien lo visita.',
  aboutImageUrl: null,
  contactImageUrl: null,
  address: 'Carmona, cabecera del cantón de Nandayure, Guanacaste, Costa Rica',
  phone: '+506 2650-0000',
  email: 'info@camaraturismonandayure.cr',
  officeHours: 'Lunes a viernes, 8:00 a.m. – 4:00 p.m.',
};

@Injectable()
export class InstitutionalInfoService {
  constructor(private readonly prisma: PrismaService) {}

  get() {
    return this.prisma.institutionalInfo.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: DEFAULTS,
    });
  }

  async update(dto: UpdateInstitutionalInfoDto) {
    await this.get(); // make sure the singleton row exists before a plain update
    return this.prisma.institutionalInfo.update({
      where: { id: SINGLETON_ID },
      data: dto,
    });
  }
}
