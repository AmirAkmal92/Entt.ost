define([], function () {

    const template = `<tr data-uid="#= WebId #">
                    <td><input type="checkbox" class="selected-consignment #:ConNote==\"\"? \"\" : \"disabled\"#" #:ConNote==\"\"? \"\" : \"disabled\"# name="check-consignment-#:WebId#" data-webid="#:WebId#" data-checked="false"><br></td>
                    <td>#: SenderName #</td> 
                    <td>#: (RecipientName === undefined) ? "" :  RecipientName #</td>
                    <td> <span>#:ProductWeight# kg</span> 
                         <span class="#:IsInternational==\"true\"? \"\" : \"hidden\"# label label-sm label-success label-mini pull-right"><i class="fa fa-plane"></i> International </span>
                         <span class="#:IsInternational==\"false\"? \"\" : \"hidden\"# label label-sm label-info label-mini pull-right"><i class="fa fa-truck"></i> Domestic </span>
                    </td> 
                    <td>#: (ConNote === undefined) ? "" : ConNote #</td> 
                    <td><span>#: (CodAmount === undefined) ? "" : CodAmount #</span> <span>#: (CcodAmount === undefined) ? "" : CcodAmount #</span></td> 
                    <td> 
                        <a href="ost\\#consignment-request-pemberi/#:Id#/consignments/#:WebId#" class="btn btn-outline yellow-casablanca #:ConNote==\"\"? \"\" : \"disabled\"#" title="Edit">
                        <i class="icon-note"></i></a>
                        <a class="btn btn-outline yellow-casablanca delete-consignment #:ConNote==\"\"? \"\" : \"disabled\"#" title="Delete" data-webid="#:WebId#"">
                        <i class="icon-trash"></i></a>
                        <a class="btn btn-outline yellow-casablanca print-a4 #:ConNote==\"\"? \"disabled\" : \"\"# #:IsPickupScheduled==\"false\"? \"disabled\" : \"\"#" title="Print-A4" data-webid="#:WebId#"">
                        <i class="icon-printer"></i></a>
                        <a class="btn btn-outline yellow-casablanca print-thermal #:ConNote==\"\"? \"disabled\" : \"\"# #:IsPickupScheduled==\"false\"? \"disabled\" : \"\"# #:IsInternational==\"false\"? \"\" : \"hidden\"#" title="Print-Thermal" data-webid="#:WebId#"">
                        <i class="fa fa-file-pdf-o"></i></a>
                        <a class="btn btn-outline yellow-casablanca print-commercial-invoice #:ConNote==\"\"? \"disabled\" : \"\"# #:IsPickupScheduled==\"false\"? \"disabled\" : \"\"# #:IsInternational==\"true\"? \"\" : \"hidden\"#" title="Print-Commercial-Invoice" data-webid="#:WebId#"">
                        <i class="icon-notebook"></i></a>
                        <a class="btn btn-outline yellow-casablanca print-commercial-invoice #:ConNote==\"\"? \"disabled\" : \"\"# #:IsPickupScheduled==\"false\"? \"disabled\" : \"\"# #:IsBorneo==\"true\"? \"\" : \"hidden\"#" title="Print-Commercial-Invoice" data-webid="#:WebId#"">
                        <i class="icon-notebook"></i></a>
                    </td>
                    </tr>`;


    return {
        template: template
    };
});