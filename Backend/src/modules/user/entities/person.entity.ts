export class PersonEntity {
  id_person!: string;
  name!: string;
  first_lastname!: string;
  second_lastname!: string;
  phone!: string;
  created_at!: Date;
  updated_at!: Date;

  constructor(partial: Partial<PersonEntity>) {
    Object.assign(this, partial);
  }
}