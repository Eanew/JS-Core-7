const ErrorMessage = {
    INVALID_PARAMETER: `Указан недопустимый параметр!`,
    ALREADY_STARTED: `Машина уже заведена`,
    NOT_STARTED: `Машина ещё не заведена`,
    INVALID_FUEL_VALUE: `Неверное количество топлива для заправки`,
    TOO_MUCH_FUEL_VALUE: `Топливный бак переполнен`,
    INVALID_SPEED: `Неверная скорость`,
    INVALID_HOURS: `Неверное количество часов`,
    TOO_FAST: `Машина не может ехать так быстро`,
    NOT_STARTED_TO_DRIVE: `Машина должна быть заведена, чтобы ехать`,
    NOT_ENOUGH_FUEL: `Недостаточно топлива`,
}

const LITERS_PER_KILOMETERS_MULTIPLIER = 100

const Config = {
    FUEL_VALUE_BY_DEFAULT: 0,
    IS_STARTED_VALUE_BY_DEFAULT: false,
    MILEAGE_VALUE_BY_DEFAULT: 0,
}

const Parameter = {
    BRAND_NAME_LENGTH: `BRAND_NAME_LENGTH`,
    MODEL_NAME_LENGTH: `MODEL_NAME_LENGTH`,
    MANUFACTURING_YEAR: `MANUFACTURING_YEAR`,
    MAX_SPEED: `MAX_SPEED`,
    FUEL_VOLUME: `FUEL_VOLUME`,
    FUEL_CONSUMPTION: `FUEL_CONSUMPTION`,
}

const parametersRange = {
    [Parameter.BRAND_NAME_LENGTH]: { FROM: 1, TO: 50 },
    [Parameter.MODEL_NAME_LENGTH]: { FROM: 1, TO: 50 },
    [Parameter.MANUFACTURING_YEAR]: { FROM: 1900, TO: new Date().getFullYear() },
    [Parameter.MAX_SPEED]: { FROM: 100, TO: 300 },
    [Parameter.FUEL_VOLUME]: { FROM: 5, TO: 20 },
    [Parameter.FUEL_CONSUMPTION]: { FROM: 1.2, TO: 3 },
}

const isAllowableRange = (parameter, value) => {
    if (typeof value === `string`) value = value.length

    return Boolean(
        value >= parametersRange[parameter].FROM &&
        value <= parametersRange[parameter].TO
    )
}

const isValidFlag = flag => typeof flag === `boolean`

const isValidPositiveNumber = number => Boolean(
    Number.isFinite(number) &&
    number > 0
)

const isAllowableBrand = brand => Boolean(
    typeof brand === `string` &&
    isAllowableRange(Parameter.BRAND_NAME_LENGTH, brand)
)

const isAllowableModel = model => Boolean(
    typeof model === `string` &&
    isAllowableRange(Parameter.MODEL_NAME_LENGTH, model)
)

const isAllowableManufacturingYear = year => Boolean(
    Number.isFinite(year) &&
    Number.isInteger(year) &&
    isAllowableRange(Parameter.MANUFACTURING_YEAR, year)
)
    
const isAllowableMaxSpeed = speed => Boolean(
    Number.isFinite(speed) &&
    isAllowableRange(Parameter.MAX_SPEED, speed)
)
    
const isAllowableFuelVolume = volume => Boolean(
    Number.isFinite(volume) &&
    isAllowableRange(Parameter.FUEL_VOLUME, volume)
)
    
const isAllowableFuelConsumption = consumption => Boolean(
    Number.isFinite(consumption) &&
    isAllowableRange(Parameter.FUEL_CONSUMPTION, consumption)
)

const isValidCurrentFuelVolume = (current, max) => Boolean(
    Number.isFinite(current) &&
    current >= 0 &&
    current <= max
)

const isValidMileage = mileage => Boolean(
    Number.isFinite(mileage) &&
    mileage >= 0
)

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
        currentFuelVolume = Config.FUEL_VALUE_BY_DEFAULT,
        isStarted = Config.IS_STARTED_VALUE_BY_DEFAULT,
        mileage = Config.MILEAGE_VALUE_BY_DEFAULT,
    ) {
        if (
            !isAllowableBrand(brand) ||
            !isAllowableModel(model) ||
            !isAllowableManufacturingYear(yearOfManufacturing) ||
            !isAllowableMaxSpeed(maxSpeed) ||
            !isAllowableFuelVolume(maxFuelVolume) ||
            !isAllowableFuelConsumption(fuelConsumption) ||
            !isValidCurrentFuelVolume(currentFuelVolume, maxFuelVolume) ||
            !isValidFlag(isStarted) ||
            !isValidMileage(mileage)
        ) {
            throw new Error(ErrorMessage.INVALID_PARAMETER)
        }

        this.#brand = brand
        this.#model = model
        this.#yearOfManufacturing = yearOfManufacturing
        this.#maxSpeed = maxSpeed
        this.#maxFuelVolume = maxFuelVolume
        this.#fuelConsumption = fuelConsumption
        this.#currentFuelVolume = currentFuelVolume
        this.#isStarted = isStarted
        this.#mileage = mileage
    }

    start() {
        if(this.#isStarted) throw new Error(ErrorMessage.ALREADY_STARTED)
        this.#isStarted = true
    }

    shutDownEngine() {
        if(!this.#isStarted) throw new Error(ErrorMessage.NOT_STARTED)
        this.#isStarted = false
    }

    fillUpGasTank(liters) {
        if (!isValidPositiveNumber(liters)) throw new Error(ErrorMessage.INVALID_FUEL_VALUE)

        const newFuelVolume = this.#currentFuelVolume + liters

        if (newFuelVolume > this.#maxFuelVolume) throw new Error(ErrorMessage.TOO_MUCH_FUEL_VALUE)
        this.#currentFuelVolume = newFuelVolume
    }

    drive(speed, hours) {
        if (!isValidPositiveNumber(speed)) throw new Error(ErrorMessage.INVALID_SPEED)
        if (!isValidPositiveNumber(hours)) throw new Error(ErrorMessage.INVALID_HOURS)
        if (speed > this.#maxSpeed) throw new Error(ErrorMessage.TOO_FAST)
        if (!this.#isStarted) throw new Error(ErrorMessage.NOT_STARTED_TO_DRIVE)

        const distanceInKilometers = speed * hours
        const requiredFuel = this.#fuelConsumption * distanceInKilometers / LITERS_PER_KILOMETERS_MULTIPLIER

        if (requiredFuel > this.#currentFuelVolume) throw new Error(ErrorMessage.NOT_ENOUGH_FUEL)

        this.#currentFuelVolume -= requiredFuel
        this.#mileage += distanceInKilometers
    }

    get brand() {
        return this.#brand
    }

    set brand(brand) {
        if (!isAllowableBrand(brand)) throw new Error(ErrorMessage.INVALID_PARAMETER)
        this.#brand = brand
    }
    
    get model() {
        return this.#model
    }

    set model(model) {
        if (!isAllowableModel(model)) throw new Error(ErrorMessage.INVALID_PARAMETER)
        this.#model = model
    }
    
    get yearOfManufacturing() {
        return this.#yearOfManufacturing
    }

    set yearOfManufacturing(year) {
        if (!isAllowableManufacturingYear(year)) throw new Error(ErrorMessage.INVALID_PARAMETER)
        this.#yearOfManufacturing = year
    }
    
    get maxSpeed() {
        return this.#maxSpeed
    }

    set maxSpeed(speed) {
        if (!isAllowableMaxSpeed(speed)) throw new Error(ErrorMessage.INVALID_PARAMETER)
        this.#maxSpeed = speed
    }
    
    get maxFuelVolume() {
        return this.#maxFuelVolume
    }

    set maxFuelVolume(volume) {
        if (!isAllowableFuelVolume(volume)) throw new Error(ErrorMessage.INVALID_PARAMETER)
        this.#maxFuelVolume = volume
    }
    
    get fuelConsumption() {
        return this.#fuelConsumption
    }

    set fuelConsumption(consumption) {
        if (!isAllowableFuelConsumption(consumption)) throw new Error(ErrorMessage.INVALID_PARAMETER)
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
