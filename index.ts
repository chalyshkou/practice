// The Decorator pattern is a structural design pattern that allows you to dynamically
// add new behaviors and functionality to an object by placing it
// inside special wrapper objects.

// TS Decorators
// CLASS, METHOD, PROPERTY, ACCESSOR(GET/SET)
// ALLOW DYNAMICALLY CHANGE CODE BEHAVIOR, ADD METADATA OR EXPAND FUNCTIONALITY
// WITHOUT CHANGING CLASS ITSELF

// Example  1: Basic decorator example

const add = (...args: number[]) => [...args].reduce((sum, a) => sum + a, 0);
const sub = (a: number, b: number) => a - b;
const multi = (...args: number[])  => [...args].reduce((res, a) => res * a,  1);
const div = (a: number, b: number) => a / b;

const logDecorator = (fn: Function): Function => {
    return (...args: number[]) => {
        console.log(`Operation: ${fn.name}`);

        args.forEach((arg, idx) => {
            console.log(`ARG ${idx}: ${arg}`);
        });

        const result = fn(...args);

        console.log(`RESULT: ${result}`);

        return result;
    }
}

const [
    addLogged,
    subLogged,
    multiLogged,
    divLogged
] = [add, sub, multi, div].map(logDecorator);

addLogged(4, 5);
subLogged(10, 5);
multiLogged(7, 7, 10);
divLogged(100, 25);


// In modern TypeScript (as of version 5.0), decorators have become
// an official ECMAScript standard. They no longer require the `experimentalDecorators`
// flag to be enabled in `tsconfig.json` and now operate in accordance with the
// formal specification.
// In this new standard, a decorator function always
// accepts exactly two arguments: `value` (the element being decorated) and
// `context` (an object containing metadata about that element).

// Example 2: TS Decorator
// + ClassDecoratorContext (metaprogramming, automatic class registration)
// + ClassMethodDecoratorContext  
// ClassFieldDecoratorContext 
// ClassGetterDecoratorContext / ClassSetterDecoratorContext
// + ClassAccessorDecoratorContext 

const routeRegistry = new Map<string, Function>();

const isAuthorized = () => true;

const validateUser = (method: Function, context: ClassMethodDecoratorContext) => {
    return function(this: UserService, user: User) {
        const isValid = user.firstName && user.lastName;

        if (!isValid) {
            throw new Error(`Validation failed for ${context.kind} ${context.name.toString()}!`);
        }

        return method.call(this, user);
    }
}

const checkAuth = (method: Function, context: ClassMethodDecoratorContext) => {
    return function(this: UserService, ...args: unknown[]) {
        if (!isAuthorized()) {
            throw new Error(`Authorization failed for ${context.kind} ${context.name.toString()}!`);
        }

        return method.call(this, ...args);
    }
}

const RegisterService = (path: string) => {
    return (targetService: Function, context: ClassDecoratorContext) => {
        context.addInitializer(() => {
            routeRegistry.set(path, targetService);
        });
    };
}

type User = {
    firstName: string,
    lastName: string
}

class Service {
    protected origin = "http://localhost:3000"
}

@RegisterService("/api/users")
class UserService extends Service {
    private users: User[] = [];

    @checkAuth
    @validateUser
    create(user: User) {
        this.users.push(user);
    }

    @checkAuth
    @validateUser
    update(user: User) {
        console.log("UPDATING USER...");
    }

    @checkAuth
    delete() {
        console.log("DELETING USER...");
    }

    @checkAuth
    getUsers() {
        return this.users;
    }
}

const service = new UserService();
service.create({firstName: "John", lastName: "Doe"});
service.create({firstName: "John", "lastName": "Lennon"});
// service.create({name: "Ilya", last: "Chalyshkou"});




// Example 3 (ClassAccessorDecoratorContext)

// The `accessor` keyword was introduced for one primary purpose: to give decorators full control over a property.
// Because the property is transformed into a getter and a setter, a decorator (`ClassAccessorDecoratorContext`) gains the ability to:
// 1. Intercept the moment a variable is read (for example, to implement lazy data loading).
// 2. Intercept the moment a variable is modified.

const FormatEmail = (target: ClassAccessorDecoratorTarget<Account, string>, context: ClassAccessorDecoratorContext) => {
    return {
        get(this: Account) {
            return target.get.call(this);
        },

        set(this: Account, value: string) {
            target.set.call(this, value.trim().toLowerCase());
        }
    }
}
class Account {
    @FormatEmail
    accessor email: string

    constructor(email: string) {
        this.email = email;
    }
}

const acc = new Account("  sOmE@EMAIL.com ");