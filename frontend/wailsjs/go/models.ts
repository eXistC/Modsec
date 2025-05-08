export namespace service {
	
	export class BookmarkResponse {
	    item_id: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new BookmarkResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item_id = source["item_id"];
	        this.status = source["status"];
	    }
	}
	export class CreateCategoryResponse {
	    Category: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateCategoryResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Category = source["Category"];
	        this.status = source["status"];
	    }
	}
	export class CreateItemResponse {
	    item_id: number;
	    title: string;
	    // Go type: time
	    createAt: any;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateItemResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item_id = source["item_id"];
	        this.title = source["title"];
	        this.createAt = this.convertValues(source["createAt"], null);
	        this.message = source["message"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DeleteCategoryResponse {
	    category_id: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new DeleteCategoryResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.category_id = source["category_id"];
	        this.status = source["status"];
	    }
	}
	export class UpdateItemResponse {
	    item_id: number;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateItemResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.item_id = source["item_id"];
	        this.message = source["message"];
	    }
	}

}

