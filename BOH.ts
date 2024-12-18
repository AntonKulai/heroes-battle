// Частина 1: Визначення типів та інтерфейсів

// Enum для типів героїв
enum HeroType {
    Warrior = "WARRIOR",
    Mage = "MAGE",
    Archer = "ARCHER"
}

// Enum для типів атак
enum AttackType {
    Physical = "PHYSICAL",
    Magical = "MAGICAL",
    Ranged = "RANGED"
}

// Interface для характеристик героя
interface HeroStats {
    health: number;
    attack: number;
    defense: number;
    speed: number;
}

// Interface для героя
interface Hero {
    id: number;
    name: string;
    type: HeroType;
    attackType: AttackType;
    stats: HeroStats;
    isAlive: boolean;
}

// Type для результату атаки
type AttackResult = {
    damage: number;       // завданий урон
    isCritical: boolean;  // чи був критичний урон
    remainingHealth: number; // хп, що залишилося у захисника після атаки
}

// Глобальний лічильник ID для героїв
let heroIdCounter: number = 1;

// Частина 2: Функції

// Функція створення нового героя
function createHero(name: string, type: HeroType): Hero {
    // В залежності від типу героя задаємо базові характеристики
    let baseStats: HeroStats;
    let attackType: AttackType;

    // Визначаємо характеристики та тип урона для кожного типу героя
    // Тут можна корегувати цифри під баланс гри
    switch (type) {
        case HeroType.Warrior:
            // Воїн - зазвичай має більше хп та армор, середній урон, помірний мс (швидкість)
            baseStats = {
                health: 100,
                attack: 20,
                defense: 15,
                speed: 10
            };
            attackType = AttackType.Physical;
            break;
        case HeroType.Mage:
            // Маг - менше хп, високий показник урону (магічної), менший армор, високий мс
            baseStats = {
                health: 80,
                attack: 25,
                defense: 5,
                speed: 15
            };
            attackType = AttackType.Magical;
            break;
        case HeroType.Archer:
            // Лучник - середнє хп, середній урон, середній армор, високий мс
            baseStats = {
                health: 90,
                attack: 18,
                defense: 10,
                speed: 20
            };
            attackType = AttackType.Ranged;
            break;
        default:
            // За замовчуванням створюємо воїна, хоча цей кейс теоретично не має статися
            baseStats = {
                health: 100,
                attack: 20,
                defense: 15,
                speed: 10
            };
            attackType = AttackType.Physical;
            break;
    }

    // Створюємо героя з унікальним ID, переданим ім'ям, обраним типом та статами (характеристиками)
    const newHero: Hero = {
        id: heroIdCounter++,
        name: name,
        type: type,
        attackType: attackType,
        stats: baseStats,
        isAlive: true
    };

    return newHero;
}

// Функція розрахунку урона
function calculateDamage(attacker: Hero, defender: Hero): AttackResult {
    // Базовий урон - це значення атаки атакуючого
    let baseDamage = attacker.stats.attack;
    let finalDamage: number;

    // Залежно від типу атаки можна варіювати формулу
    // Наприклад:
    // PHYSICAL: сильно залежить від армора
    // MAGICAL: слабо залежить від армора
    // RANGED: середній вплив армора
    switch (attacker.attackType) {
        case AttackType.Physical:
            // Фізичний урон, армор зменшує пошкодження приблизно наполовину
            finalDamage = baseDamage - defender.stats.defense * 0.5;
            break;
        case AttackType.Magical:
            // Магічний урон слабше залежить від армора
            finalDamage = baseDamage * 1.2 - defender.stats.defense * 0.2;
            break;
        case AttackType.Ranged:
            // Ренж атака (Дистанційна атака), середній вплив армору
            finalDamage = baseDamage * 0.9 - defender.stats.defense * 0.3;
            break;
        default:
            finalDamage = baseDamage - defender.stats.defense * 0.5;
            break;
    }

    // Гарантуємо, що урон не буде від'ємним
    if (finalDamage < 0) {
        finalDamage = 0;
    }

    // Додаємо 20% шанс критичного удару, який подвоює урон
    // Генеруємо випадкове число від 0 до 1:
    const isCriticalHit = Math.random() < 0.2; // 20% ймовірність
    if (isCriticalHit) {
        finalDamage *= 2;
    }

    // Віднімаємо урон від хп захисника
    defender.stats.health -= finalDamage;
    if (defender.stats.health <= 0) {
        defender.stats.health = 0;
        defender.isAlive = false;
    }

    return {
        damage: finalDamage,
        isCritical: isCriticalHit,
        remainingHealth: defender.stats.health
    };
}

// Generic функція для пошуку героя в масиві за властивістю
function findHeroByProperty<T extends keyof Hero>(
    heroes: Hero[],
    property: T,
    value: Hero[T]
): Hero | undefined {
    // Перебираємо масив героїв та шукаємо першого, в якого зазначена властивість відповідає потрібному значенню
    return heroes.find((hero) => hero[property] === value);
}

// Функція проведення раунду бою між двома героями
function battleRound(hero1: Hero, hero2: Hero): string {
    // Перевіряємо, чи обоє герої живі
    if (!hero1.isAlive || !hero2.isAlive) {
        return "Бій неможливий, один з героїв мертвий!";
    }

    // Визначаємо, хто атакує першим (за швидкістю)
    let firstAttacker: Hero;
    let secondAttacker: Hero;
    if (hero1.stats.speed > hero2.stats.speed) {
        firstAttacker = hero1;
        secondAttacker = hero2;
    } else if (hero2.stats.speed > hero1.stats.speed) {
        firstAttacker = hero2;
        secondAttacker = hero1;
    } else {
        // Якщо мс однаковий, нехай hero1 атакує першим
        firstAttacker = hero1;
        secondAttacker = hero2;
    }

    // Перший атакер наносить удар
    const firstAttackResult = calculateDamage(firstAttacker, secondAttacker);
    let battleLog = `${firstAttacker.name} атакує ${secondAttacker.name}. Завдано ${firstAttackResult.damage} шкоди` +
        (firstAttackResult.isCritical ? " (Критичний удар!)" : "") +
        `. Залишок здоров'я у ${secondAttacker.name}: ${firstAttackResult.remainingHealth}.\n`;

    // Якщо після удару другий герой вижив, він контратакує
    if (secondAttacker.isAlive) {
        const secondAttackResult = calculateDamage(secondAttacker, firstAttacker);
        battleLog += `${secondAttacker.name} атакує ${firstAttacker.name}. Завдано ${secondAttackResult.damage} шкоди` +
            (secondAttackResult.isCritical ? " (Критичний удар!)" : "") +
            `. Залишок здоров'я у ${firstAttacker.name}: ${secondAttackResult.remainingHealth}.\n`;
    } else {
        battleLog += `${secondAttacker.name} загинув, контратаки не буде.\n`;
    }

    // Перевіряємо стан героїв після раунду
    if (!firstAttacker.isAlive) {
        battleLog += `${firstAttacker.name} загинув у бою!\n`;
    }
    if (!secondAttacker.isAlive) {
        battleLog += `${secondAttacker.name} загинув у бою!\n`;
    }

    return battleLog;
}

// Частина 3: Практичне застосування

// Створюємо масив героїв
const heroes: Hero[] = [
    createHero("Дмитро", HeroType.Warrior),
    createHero("Мерлін", HeroType.Mage),
    createHero("Ліана", HeroType.Archer)
];

// Демонстрація створення героїв
const warrior = createHero("Борис", HeroType.Warrior);
const mage = createHero("Гендальф", HeroType.Mage);
const archer = createHero("Робін", HeroType.Archer);

// Додаємо їх у масив для прикладу
heroes.push(warrior, mage, archer);

// Пошук героїв за різними властивостями
const foundWarrior = findHeroByProperty(heroes, "type", HeroType.Warrior);
const foundArcherByName = findHeroByProperty(heroes, "name", "Ліана");

// Виводимо результати пошуку
console.log("Знайдений воїн:", foundWarrior);
console.log("Знайдений лучник за іменем 'Ліана':", foundArcherByName);

// Проведемо кілька раундів бою між героями
// Битва між Дмитро(Воїн) та Мерлін(Маг), які вже є в масиві
const heroDmytro = findHeroByProperty(heroes, "name", "Дмитро");
const heroMerlin = findHeroByProperty(heroes, "name", "Мерлін");

if (heroDmytro && heroMerlin) {
    console.log("=== Початок бою між Дмитром та Мерліном ===");
    console.log(battleRound(heroDmytro, heroMerlin));
    console.log(battleRound(heroDmytro, heroMerlin));
    console.log("=== Кінець бою ===");
}

// Ще один приклад бою - між Борис(воїн) та Гендальф(маг)
console.log("=== Початок бою між Борисом та Гендальфом ===");
console.log(battleRound(warrior, mage));
console.log(battleRound(warrior, mage));
console.log("=== Кінець бою ===");
