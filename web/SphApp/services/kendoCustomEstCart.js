define([], function () {

    const template = `<tr data-uid="#= WebId #">
                    <td>#: SenderName #</td> 
                    <td>#: RecipientName #</td>
                    <td>#: ProductWeight #</td> 
                    <td>#: ProductWeight #</td> 
                    <td> 
                        <a href="ost\\#consignment-request-pemberi/#:Id#/consignments/#:WebId#" class="btn btn-circle btn-icon-only btn-outline yellow-casablanca">
                        <i class="icon-note"></i></a>
                        <a class="btn btn-circle btn-icon-only btn-outline yellow-casablanca delete-consignment" title="Delete" id="#:WebId#"">
                        <i class="icon-trash"></i></a>
                    </td>
                    </tr>`;


    return {
        template: template
    };
});