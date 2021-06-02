const FUEL_CONSUMPTION_PER_KILOMETER_QUOTIENT = 100

const ErrorMessage = {
    WRONG_PROPERTY_VALUE: `Указан недопустимый параметр`,
    WRONG_FUEL_VALUE: `Неверное количество топлива для заправки`,
    TOO_MUCH_FUEL_VALUE: `Топливный бак переполнен`,
    WRONG_SPEED_VALUE: `Неверная скорость`,
    IS_SPEED_VALUE_GREATER_THAN_MAX_SPEED: `Машина не может ехать так быстро`,
    WRONG_HOURS_VALUE: `Неверное количество часов`,
    IS_ALREADY_STARTED: `Машина уже заведена`,
    IS_NOT_STARTED: `Машина ещё не заведена`,
    IS_NOT_STARTED_TO_DRIVE: `Машина должна быть заведена, чтобы ехать`,
    NOT_ENOUGH_FUEL_TO_DRIVE: `Недостаточно топлива`,
}

const PropertyName = {
    BRAND: `BRAND`,
    MODEL: `MODEL`,
    MANUFACTURING_YEAR: `MANUFACTURING_YEAR`,
    MAX_SPEED: `MAX_SPEED`,
    FUEL_VOLUME: `FUEL_VOLUME`,
    FUEL_CONSUMPTION: `FUEL_CONSUMPTION`,
}

const propertyValueRange = {
    [PropertyName.BRAND]:               { from: 1,      to: 50 },
    [PropertyName.MODEL]:               { from: 1,      to: 50 },
    [PropertyName.MANUFACTURING_YEAR]:  { from: 1900,   to: new Date().getFullYear() },
    [PropertyName.MAX_SPEED]:           { from: 100,    to: 300 },
    [PropertyName.FUEL_VOLUME]:         { from: 5,      to: 20 },
    [PropertyName.FUEL_CONSUMPTION]:    { from: 1.2,    to: 3 },

    isAllowed(propertyName, value) {
        const { from, to } = this[propertyName]

        if (typeof value === `string`) value = value.length
    
        return value >= from && value <= to
    },
}

const isGreaterThanZeroValidNumber = value => Number.isFinite(value) && value > 0

const isValid = {
    brand: value => Boolean(
        typeof value === `string` &&
        propertyValueRange.isAllowed(PropertyName.BRAND, value)
    ),

    model: value => Boolean(
        typeof value === `string` &&
        propertyValueRange.isAllowed(PropertyName.MODEL, value)
    ),

    manufacturingYear: value => Boolean(
        Number.isFinite(value) &&
        Number.isInteger(value) &&
        propertyValueRange.isAllowed(PropertyName.MANUFACTURING_YEAR, value)
    ),

    maxSpeed: value => Boolean(
        Number.isFinite(value) &&
        propertyValueRange.isAllowed(PropertyName.MAX_SPEED, value)
    ),

    maxFuelVolume: value => Boolean(
        Number.isFinite(value) &&
        propertyValueRange.isAllowed(PropertyName.FUEL_VOLUME, value)
    ),

    fuelConsumption: value => Boolean(
        Number.isFinite(value) &&
        propertyValueRange.isAllowed(PropertyName.FUEL_CONSUMPTION, value)
    ),

    fuelVolume: (value, limit) => Boolean(
        Number.isFinite(value) &&
        value >= 0 &&
        value <= limit
    ),

    flag: value => Boolean(
        typeof value === `boolean`
    ),

    mileage: value => Boolean(
        Number.isFinite(value) &&
        value >= 0
    ),

    fuelRefill: isGreaterThanZeroValidNumber,
    speed: isGreaterThanZeroValidNumber,
    hours: isGreaterThanZeroValidNumber,
}

const Car = class {
    #brand
    #model
    #yearOfManufacturing
    #maxSpeed
    #maxFuelVolume
    #fuelConsumption
    #currentFuelVolume
    #isStarted
    #mileage

    constructor(
        brand,
        model,
        yearOfManufacturing,
        maxSpeed,
        maxFuelVolume,
        fuelConsumption,
        currentFuelVolume = 0,
        isStarted = false,
        mileage = 0,
    ) {
        this.brand = brand
        this.model = model
        this.yearOfManufacturing = yearOfManufacturing
        this.maxSpeed = maxSpeed
        this.maxFuelVolume = maxFuelVolume
        this.fuelConsumption = fuelConsumption

        if (!isValid.fuelVolume(currentFuelVolume, maxFuelVolume) ||
            !isValid.flag(isStarted) ||
            !isValid.mileage(mileage)
        ) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)

        this.#currentFuelVolume = currentFuelVolume
        this.#isStarted = isStarted
        this.#mileage = mileage
    }

    start() {
        if(this.isStarted) throw new Error(ErrorMessage.IS_ALREADY_STARTED)
        this.#isStarted = true
    }

    shutDownEngine() {
        if(!this.isStarted) throw new Error(ErrorMessage.IS_NOT_STARTED)
        this.#isStarted = false
    }

    fillUpGasTank(liters) {
        if (!isValid.fuelRefill(liters)) throw new Error(ErrorMessage.WRONG_FUEL_VALUE)

        const fuelVolumeInLiters = this.currentFuelVolume + liters

        if (fuelVolumeInLiters > this.maxFuelVolume) throw new Error(ErrorMessage.TOO_MUCH_FUEL_VALUE)
        this.#currentFuelVolume = fuelVolumeInLiters
    }

    drive(speed, hours) {
        if (!isValid.speed(speed)) throw new Error(ErrorMessage.WRONG_SPEED_VALUE)
        if (!isValid.hours(hours)) throw new Error(ErrorMessage.WRONG_HOURS_VALUE)
        if (speed > this.maxSpeed) throw new Error(ErrorMessage.IS_SPEED_VALUE_GREATER_THAN_MAX_SPEED)
        if (!this.isStarted) throw new Error(ErrorMessage.IS_NOT_STARTED_TO_DRIVE)

        const distanceInKilometers = speed * hours
        const requiredFuelVolume = this.fuelConsumption * distanceInKilometers / FUEL_CONSUMPTION_PER_KILOMETER_QUOTIENT

        if (requiredFuelVolume > this.currentFuelVolume) throw new Error(ErrorMessage.NOT_ENOUGH_FUEL_TO_DRIVE)
        this.#currentFuelVolume -= requiredFuelVolume
        this.#mileage += distanceInKilometers
    }

    get brand() {
        return this.#brand
    }

    set brand(brand) {
        if (!isValid.brand(brand)) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)
        this.#brand = brand
    }
    
    get model() {
        return this.#model
    }

    set model(model) {
        if (!isValid.model(model)) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)
        this.#model = model
    }
    
    get yearOfManufacturing() {
        return this.#yearOfManufacturing
    }

    set yearOfManufacturing(year) {
        if (!isValid.manufacturingYear(year)) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)
        this.#yearOfManufacturing = year
    }
    
    get maxSpeed() {
        return this.#maxSpeed
    }

    set maxSpeed(speed) {
        if (!isValid.maxSpeed(speed)) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)
        this.#maxSpeed = speed
    }
    
    get maxFuelVolume() {
        return this.#maxFuelVolume
    }

    set maxFuelVolume(volume) {
        if (!isValid.maxFuelVolume(volume)) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)
        this.#maxFuelVolume = volume
    }
    
    get fuelConsumption() {
        return this.#fuelConsumption
    }

    set fuelConsumption(consumption) {
        if (!isValid.fuelConsumption(consumption)) throw new Error(ErrorMessage.WRONG_PROPERTY_VALUE)
        this.#fuelConsumption = consumption
    }

    get currentFuelVolume() {
        return this.#currentFuelVolume
    }
    
    get isStarted() {
        return this.#isStarted
    }
    
    get mileage() {
        return this.#mileage
    }
}

module.exports = Car
